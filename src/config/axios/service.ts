import axios, {
  AxiosInstance,
  AxiosRequestHeaders,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig
} from 'axios'
declare type Recordable<T = any, K extends string | number | symbol = string> = Record<
  K extends null | undefined ? string : K,
  T
>
import qs from 'qs'
import { config } from '@/config/axios/config'
import { getAccessToken, removeToken } from './auth'
import Message from 'ant-design-vue/lib/message'
import { errorCode } from '@/config/axios/errorCode'
const { result_code, base_url, request_timeout } = config

// 需要忽略的提示。忽略后，自动 Promise.reject('error')
const ignoreMsgs = [
  '无效的刷新令牌', // 刷新令牌被删除时，不用提示
  '刷新令牌已过期' // 使用刷新令牌，刷新获取新的访问令牌时，结果因为过期失败，此时需要忽略。否则，会导致继续 401，无法跳转到登出界面
]
// Axios 无感知刷新令牌，参考 https://www.dashingdog.cn/article/11 与 https://segmentfault.com/a/1190000020210980 实现

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: base_url, // api 的 base_url
  timeout: request_timeout, // 请求超时时间
  withCredentials: false // 禁用 Cookie 等信息
})

// request拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    ;(config as Recordable).headers['Authorization'] = getAccessToken(config.data?.bleRequest) // 让每个请求携带自定义token
    const params = config.params || {}
    const data = config.data || false
    if (
      config.method?.toUpperCase() === 'POST' &&
      (config.headers as AxiosRequestHeaders)['Content-Type'] ===
        'application/x-www-form-urlencoded'
    ) {
      config.data = qs.stringify(data)
    }
    // get参数编码
    if (config.method?.toUpperCase() === 'GET' && params) {
      let url = config.url + '?'
      for (const propName of Object.keys(params)) {
        const value = params[propName]
        if (value !== void 0 && value !== null && typeof value !== 'undefined') {
          if (typeof value === 'object') {
            for (const val of Object.keys(value)) {
              const params = propName + '[' + val + ']'
              const subPart = encodeURIComponent(params) + '='
              url += subPart + encodeURIComponent(value[val]) + '&'
            }
          } else {
            url += `${propName}=${encodeURIComponent(value)}&`
          }
        }
      }
      url = url.slice(0, -1)
      config.params = {}
      config.url = url
    }
    return config
  },
  (error: AxiosError) => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  async (response: AxiosResponse<any>) => {
    const { data } = response
    if (!data) {
      // 返回“[HTTP]请求没有返回值”;
      throw new Error()
    }
    // 未设置状态码则默认成功状态
    const code = Number(data.code || result_code)
    // 二进制数据则直接返回
    if (
      response.request.responseType === 'blob' ||
      response.request.responseType === 'arraybuffer' ||
      response.data.success === true
    ) {
      return response.data
    }
    // 获取错误信息
    const msg = data.message || errorCode[code] || errorCode['default']
    if (ignoreMsgs.indexOf(msg) !== -1) {
      // 如果是忽略的错误码，直接返回 msg 异常
      return Promise.reject(msg)
    } else if (code === 401) {
      // 登陆过期，清除token 跳转到登陆页面
      removeToken()
      // 重定向到登录页面
      window.location.href = '/'
      return Promise.reject(msg)
    } else if (code === 500) {
      Message.error(msg)
      return Promise.reject(new Error(msg))
    } else if (code !== 200) {
      if (msg === '无效的刷新令牌') {
        // hard coding：忽略这个提示，直接登出
        console.log(msg)
      } else {
        Message.error(msg)
      }
      return Promise.reject('error')
    } else {
      Message.error(msg)
      return Promise.resolve(data)
    }
  },
  (error: AxiosError) => {
    console.log('err' + error) // for debug
    let { message } = error
    if (message === 'Network Error') {
      message = '操作失败,系统异常!'
    } else if (message.includes('timeout')) {
      message = '接口请求超时,请刷新页面重试!'
    } else if (message.includes('Request failed with status code')) {
      message = '请求出错，请稍候重试' + message.substr(message.length - 3)
    }
    Message.error(message)
    return Promise.reject(error)
  }
)

export { service }
