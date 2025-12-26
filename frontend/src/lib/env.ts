export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string | undefined,
  demoMode: (import.meta.env.VITE_DEMO_MODE as string | undefined) === 'true',
}

export function wsUrlFromApi(apiBaseUrl?: string) {
  if (!apiBaseUrl || apiBaseUrl.startsWith('/')) return undefined
  return apiBaseUrl.replace(/^http/i, 'ws')
}

