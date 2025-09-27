import { z } from 'zod';

import { McpToolResult, McpServerConfig } from '../../types';

import { PlanningBaseTool } from './PlanningBaseTool';

export class UpdateSlideTool extends PlanningBaseTool {
  constructor(config: McpServerConfig) {
    super(config);
  }

  public name = 'update_slide';
  public description = 'Update an existing planning slide';

  public schema = z.object({
    slideId: z.string().describe('ID of the slide to update'),
    title: z.string().optional().describe('New title for the slide'),
    content: z.string().optional().describe('Updated markdown content'),
  });

  async execute(input: z.infer<typeof this.schema>): Promise<McpToolResult> {
    try {
      const response = await this.makeRequest('/planning/update-slide', input);

      if (response.success) {
        return {
          content: [
            {
              type: 'text',
              text: `Slide updated: ${input.slideId}`,
              data: response,
            },
          ],
        };
      }

      return this.createErrorResponse(String(response.error) || 'Failed to update slide');
    } catch (error) {
      return this.createErrorResponse(
        error instanceof Error ? error.message : 'Failed to update slide',
      );
    }
  }
}
