import { z } from 'zod';

import { McpToolResult, McpServerConfig } from '../../types';

import { PlanningBaseTool } from './PlanningBaseTool';

export class StartPlanningTool extends PlanningBaseTool {
  constructor(config: McpServerConfig) {
    super(config);
  }

  public name = 'start_planning';
  public description =
    'Start a planning session. Shows a UI for the user to select an existing planning document or create a new one.';

  public schema = z.object({
    agentName: z.string().describe('The name of the agent requesting to open a document'),
    suggestedTitle: z.string().optional().describe('Optional suggested title for a new document'),
    suggestedType: z
      .enum(['markdown', 'excalidraw'])
      .optional()
      .describe('Optional suggested document type'),
    message: z.string().optional().describe('Optional message to show to the user'),
  });

  async execute(input: z.infer<typeof this.schema>): Promise<McpToolResult> {
    const { agentName, suggestedTitle, suggestedType, message } = input;

    try {
      const response = await this.makeRequest('/document/open', {
        agentName,
        suggestedTitle,
        suggestedType,
        message,
      });

      if (response.success) {
        if ('documentSelected' in response && response.documentSelected) {
          return {
            content: [
              {
                type: 'text',
                text: `Document opened: ${response.documentTitle}\nType: ${response.documentType}\nPath: ${response.filePath || 'In-memory'}`,
                data: response,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: 'User cancelled document selection',
              data: { cancelled: true },
            },
          ],
        };
      }

      return this.createErrorResponse(String(response.error) || 'Failed to open document');
    } catch (error) {
      return this.createErrorResponse(
        error instanceof Error ? error.message : 'Failed to open document',
      );
    }
  }
}
