import { z } from 'zod';

import { McpToolResult, McpServerConfig } from '../../types';

import { PlanningBaseTool } from './PlanningBaseTool';

export class GetCurrentSlideTool extends PlanningBaseTool {
  constructor(config: McpServerConfig) {
    super(config);
  }

  public name = 'get_current_slide';
  public description = 'Get the currently active planning slide';

  public schema = z.object({
    includeContent: z
      .boolean()
      .optional()
      .default(true)
      .describe('Whether to include slide content in the response'),
  });

  async execute(input: z.infer<typeof this.schema>): Promise<McpToolResult> {
    try {
      const response = await this.makeRequest('/planning/current-slide', input);

      if (response.success) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
              data: response,
            },
          ],
        };
      }

      return this.createErrorResponse(String(response.error) || 'Failed to get current slide');
    } catch (error) {
      return this.createErrorResponse(
        error instanceof Error ? error.message : 'Failed to get current slide',
      );
    }
  }
}
