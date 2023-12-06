export const AccessTokenKey = 'ACCESS_TOKEN'
export const RefreshTokenKey = 'REFRESH_TOKEN'

// 获取token
export const getAccessToken = (ble: boolean) => {
  if (ble) {
    return localStorage.getItem(AccessTokenKey)
  }
  return sessionStorage.getItem(AccessTokenKey)
}

// 设置token
export const setToken = (token: any) => {
  sessionStorage.setItem(AccessTokenKey, token)
}

// 删除token
export const removeToken = () => {
  sessionStorage.removeItem(AccessTokenKey)
}

/** 格式化token（jwt格式） */
export const formatToken = (token: string): string => {
  return 'Bearer ' + token
}
