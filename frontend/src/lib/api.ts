import axios from 'axios'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './auth'
import { env } from './env'

export const api = axios.create({
  baseURL: env.apiBaseUrl ?? '',
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshing: Promise<void> | null = null

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const status = error?.response?.status
    const original = error?.config

    if (status === 401 && original && !original.__isRetryRequest) {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        clearTokens()
        return Promise.reject(error)
      }
      if (!refreshing) {
        refreshing = (async () => {
          const res = await axios.post(
            `${env.apiBaseUrl ?? ''}/api/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } },
          )
          setTokens(res.data)
        })().finally(() => {
          refreshing = null
        })
      }
      await refreshing
      original.__isRetryRequest = true
      return api.request(original)
    }
    return Promise.reject(error)
  },
)

