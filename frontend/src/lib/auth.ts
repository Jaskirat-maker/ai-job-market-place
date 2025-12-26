export type Tokens = { accessToken: string; refreshToken: string }

const ACCESS_KEY = 'aimarket_access'
const REFRESH_KEY = 'aimarket_refresh'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(tokens: Tokens) {
  localStorage.setItem(ACCESS_KEY, tokens.accessToken)
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

