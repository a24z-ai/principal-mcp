export const BRANDING = {
  COMPANY_NAME: 'A24Z',
  PRODUCT_NAME: 'specktor.ai',
  APP_NAME: 'Specktor',
  MCP_SERVER_NAME: 'principal-ai-mcp-server',
  MCP_SERVER_CONFIG_KEY: 'principal-ai',
  MCP_SERVER_FILENAME: 'principal-ai-mcp-server.cjs',
  MCP_SERVER_BUNDLE_NAME: 'principal-ai-mcp-server.js',
  MCP_FALLBACK_DIR: '.a24z-mcp',
  VERSION_FLAG: '--principal-ai-version',
  MCP_BRIDGE_ERROR:
    'Unable to connect to MCP bridge. Please ensure the PrincipalAI app is running.',
  APP_VERSION: '1.0.2',
  MCP_VERSION: '1.0.0',
  DEFAULT_BRIDGE_PORT: 3044,
} as const;

export type BrandingConfig = typeof BRANDING;

export function getMcpFallbackPath(): string {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  return `${homeDir}/${BRANDING.MCP_FALLBACK_DIR}`;
}
