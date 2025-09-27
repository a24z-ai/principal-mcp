import * as http from 'http';

import { z } from 'zod';

import { McpToolResult, McpServerConfig } from '../types';

import { BaseTool } from './base-tool';

export interface AgentHandoffData {
  context: string;
}

export interface AgentHandoffResult {
  success: boolean;
  handoffId: string;
  timestamp: string;
  message?: string;
}

export class AgentHandoffTool extends BaseTool<AgentHandoffData, AgentHandoffResult> {
  constructor(config: McpServerConfig) {
    super(config);
  }

  public name = 'agent-context-handoff';
  public description = 'Hand off context to another AI agent for continuation of work';

  public schema = z.strictObject({
    context: z
      .string()
      .describe(
        'Markdown-formatted context including work completed, current state, relevant files, and next steps',
      ),
  }) as z.ZodType<AgentHandoffData>;

  public async execute(params: AgentHandoffData): Promise<McpToolResult<AgentHandoffResult>> {
    try {
      const response = await this.makeHttpRequest(params);

      if (response.success) {
        return this.createSuccessResponse(
          `Successfully initiated agent handoff. Handoff ID: ${response.handoffId}`,
          response,
        );
      } else {
        return this.createErrorResponse(
          `Failed to initiate agent handoff: ${response.message || 'Unknown error'}`,
        );
      }
    } catch (error) {
      return this.createErrorResponse(
        `Error during agent handoff: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async makeHttpRequest(params: AgentHandoffData): Promise<AgentHandoffResult> {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(params);

      const options = {
        hostname: this.config.bridgeHost ?? 'localhost',
        port: this.config.bridgePort,
        path: this.resolvePath('/agent-context-handoff'),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = http.request(options, res => {
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve(response);
          } catch (error) {
            reject(new Error(`Failed to parse response: ${data} ${error}`));
          }
        });
      });

      req.on('error', error => {
        reject(new Error(`HTTP request failed: ${error.message} ${error.stack}`));
      });

      req.write(postData);
      req.end();
    });
  }
}
