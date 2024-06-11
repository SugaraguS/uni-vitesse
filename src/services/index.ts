import type { InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { createUniAppAxiosAdapter } from '@uni-helper/axios-adapter'

export const http = axios.create({
  baseURL: '',
})

http.defaults.adapter = createUniAppAxiosAdapter()
http.defaults.timeout = 15000

// 请求地址
const proxyMap: Record<string, string> = {
  api: import.meta.env.VITE_SERVER_BASE_URL as string,
  connect: import.meta.env.VITE_SERVER_AUTH_URL as string,
}

function getProxyUrl(options: InternalAxiosRequestConfig<any>) {
  Object.keys(proxyMap).forEach((key) => {
    if (options.url?.startsWith(`/${key}`))
      options.url = proxyMap[key] + options.url
  })
}

http.interceptors.request.use((config) => {
  const token = uni.getStorageSync('token')
  if (token)
    config.headers.Authorization = `Bearer ${token}`

  // 非 http 开头需拼接地址
  if (!config.url?.startsWith('http')) {
    // #ifdef H5
    if (JSON.parse(__VITE_APP_PROXY__)) {
      // 啥都不需要做
    }
    else {
      getProxyUrl(config)
    }
    // #endif
    // 非H5正常拼接
    // #ifndef H5
    getProxyUrl(config)
    // #endif
  }

  return config
})

http.interceptors.response.use((response) => {
  return response
}, (error) => {
  return Promise.reject(error)
})
