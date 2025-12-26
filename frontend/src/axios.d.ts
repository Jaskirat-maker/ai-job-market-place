import 'axios'

declare module 'axios' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface AxiosRequestConfig {
    __isRetryRequest?: boolean
  }
}

