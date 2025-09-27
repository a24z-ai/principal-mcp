import { z } from 'zod';

import { McpToolResult, McpServerConfig } from '../../types';

import { PlanningBaseTool } from './PlanningBaseTool';

export class CreateSlideTool extends PlanningBaseTool {
  constructor(config: McpServerConfig) {
    super(config);
  }

  public name = 'create_slide';
  public description = 'Create a new slide in the current planning document';

  public schema = z.object({
    title: z.string().describe('Title for the new slide'),
    content: z.string().optional().describe('Markdown content for the slide'),
    afterSlideId: z.string().optional().describe('Insert the new slide after this slide ID'),
  });

  async execute(input: z.infer<typeof this.schema>): Promise<McpToolResult> {
    try {
      const response = await this.makeRequest('/planning/create-slide', input);

      if (response.success) {
        return {
          content: [
            {
              type: 'text',
              text: `Slide created: ${(response as { slideId?: string }).slideId ?? 'unknown ID'}`,
              data: response,
            },
          ],
        };
      }

      return this.createErrorResponse(String(response.error) || 'Failed to create slide');
    } catch (error) {
      return this.createErrorResponse(error instanceof Error ? error.message : 'Failed to create slide');
    }
  }
}
