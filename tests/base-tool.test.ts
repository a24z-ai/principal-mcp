import { describe, expect, test } from 'bun:test';
import { z } from 'zod';

import { BaseTool } from '../src/tools/base-tool';
import { McpServerConfig } from '../src/types';

class EchoTool extends BaseTool<{ message: string }, { message: string }> {
  name = 'echo';
  description = 'Echo a message';
  schema = z.object({ message: z.string() });

  constructor(config: McpServerConfig) {
    super(config);
  }

  async execute(input: { message: string }) {
    return this.createSuccessResponse('ok', { message: input.message });
  }

  public computePath(path: string) {
    return this.resolvePath(path);
  }
}

const baseConfig: McpServerConfig = {
  name: 'test-mcp',
  version: '0.0.0',
  bridgePort: 3043,
  bridgeHost: 'localhost',
  bridgePath: '',
};

describe('BaseTool', () => {
  test('handler returns validation error for invalid payload', async () => {
    const tool = new EchoTool(baseConfig);
    const result = await tool.handler({} as any);
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toContain('Validation error');
  });

  test('handler resolves successfully for valid payload', async () => {
    const tool = new EchoTool(baseConfig);
    const result = await tool.handler({ message: 'hello' });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.data).toEqual({ message: 'hello' });
  });

  test('resolvePath respects optional base path', () => {
    const tool = new EchoTool({ ...baseConfig, bridgePath: '' });
    expect(tool.computePath('/prompt')).toBe('/prompt');

    const toolWithBase = new EchoTool({ ...baseConfig, bridgePath: '/mcp' });
    expect(toolWithBase.computePath('/prompt')).toBe('/mcp/prompt');
  });
});
