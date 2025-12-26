import { Client } from '@stomp/stompjs'
import { getAccessToken } from './auth'
import { env, wsUrlFromApi } from './env'

export function createStompClient() {
  const token = getAccessToken()

  const explicitWsBase = wsUrlFromApi(env.apiBaseUrl)
  // If apiBaseUrl is not set (dev proxy), connect to same-origin /ws
  const brokerURL = explicitWsBase ? `${explicitWsBase}/ws` : `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`

  const client = new Client({
    brokerURL,
    reconnectDelay: 2000,
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
    debug: () => {},
  })

  return client
}

