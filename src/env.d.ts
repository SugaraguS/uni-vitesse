/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}

interface ImportMetaEnv {
  /** 网站标题，应用名称 */
  readonly VITE_APP_TITLE: string
  /** 服务端口号 */
  readonly VITE_SERVER_PORT: string
  /** 鉴权接口地址 */
  readonly VITE_SERVER_AUTH_URL: string
  /** 后台接口地址 */
  readonly VITE_SERVER_BASE_URL: string
  /** H5是否需要代理 */
  readonly VITE_APP_PROXY: 'true' | 'false'
  /** 上传图片地址 */
  readonly VITE_UPLOAD_BASEURL: string
  /** 是否清除console */
  readonly VITE_DELETE_CONSOLE: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
