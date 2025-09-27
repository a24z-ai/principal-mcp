import { z } from 'zod';

import { McpToolResult, McpServerConfig } from '../../types';

import { PlanningBaseTool } from './PlanningBaseTool';

export class NavigateToSlideTool extends PlanningBaseTool {
  constructor(config: McpServerConfig) {
    super(config);
  }

  public name = 'navigate_to_slide';
  public description = 'Navigate to a specific slide in the planning document';

  public schema = z.object({
    slideId: z.string().describe('ID of the slide to navigate to'),
  });

  async execute(input: z.infer<typeof this.schema>): Promise<McpToolResult> {
    try {
      const response = await this.makeRequest('/planning/navigate-to-slide', input);

      if (response.success) {
        return {
          content: [
            {
              type: 'text',
              text: `Navigated to slide: ${(response as { slideId?: string }).slideId ?? input.slideId}`,
              data: response,
            },
          ],
        };
      }

      return this.createErrorResponse(String(response.error) || 'Failed to navigate to slide');
    } catch (error) {
      return this.createErrorResponse(
        error instanceof Error ? error.message : 'Failed to navigate to slide',
      );
    }
  }
}
