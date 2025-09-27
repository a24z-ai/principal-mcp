import * as http from 'http';

import { BRANDING } from '../../constants/branding';
import { BaseTool } from '../../tools/base-tool';
import { McpServerConfig } from '../../types';

type PlanningRequestData = Record<string, unknown>;

interface PlanningSuccessResponse {
  success: true;
  [key: string]: unknown;
}

interface PlanningErrorResponse {
  success: false;
  error: string;
}

type PlanningResponseData = PlanningSuccessResponse | PlanningErrorResponse;

export abstract class PlanningBaseTool<TParams = unknown, TResult = unknown> extends BaseTool<
  TParams,
  TResult
> {
  constructor(config: McpServerConfig) {
    super(config);
  }

  protected async makeRequest(
    path: string,
    data: PlanningRequestData,
  ): Promise<PlanningResponseData> {
    return new Promise((resolve, reject) => {
      const bridgeHost = this.config.bridgeHost ?? 'localhost';
      const bridgePort = this.config.bridgePort ?? BRANDING.DEFAULT_BRIDGE_PORT;
      const requestPath = this.resolvePath(path);

      const postData = JSON.stringify(data);

      const options: http.RequestOptions = {
        hostname: bridgeHost,
        port: bridgePort,
        path: requestPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
        timeout: 5000,
      };

      const req = http.request(options, res => {
        let responseData = '';

        res.on('data', chunk => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(responseData);
            resolve({ success: true, ...response } as PlanningResponseData);
          } catch (error) {
            reject(new Error('Invalid response from Planning MCP Bridge' + error));
          }
        });
      });

      req.on('error', error => {
        if (error.message.includes('ECONNREFUSED')) {
          reject(
            new Error(
              'Planning MCP Bridge is not running. Please ensure it is started on port ' +
                bridgePort,
            ),
          );
        } else {
          reject(error);
        }
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(postData);
      req.end();
    });
  }
}
