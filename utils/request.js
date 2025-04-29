import config from '@/config/config.js'

// 封装请求方法
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 判断url是否存在
    if (!options.url) {
      reject('请求地址不能为空')
      return
    }
    
    // 拼接完整请求地址
    let url = options.url
    if (url.indexOf('http') !== 0) {
      url = config.baseUrl + url
    }
    
    // 获取token（如果有的话）
    const token = uni.getStorageSync('token')
    
    // 默认请求头
    const header = {
      ...config.header,
      ...options.header
    }
    
    // 如果有token，添加到请求头
    if (token) {
      header.Authorization = 'Bearer ' + token
    }
    
    // 发起请求
    uni.request({
      url: url,
      method: options.method || 'GET',
      data: options.data || {},
      header: header,
      timeout: config.timeout,
      success: (res) => {
        // 状态码2xx表示成功
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          // 未授权或token过期
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          })
          // 可以在这里处理登录过期的逻辑
          setTimeout(() => {
            // 跳转到登录页
            uni.navigateTo({
              url: '/pages/login/login'
            })
          }, 1500)
          reject(res)
        } else {
          // 其他错误
          uni.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// GET请求
const get = (url, data = {}, options = {}) => {
  return request({
    url,
    data,
    method: 'GET',
    ...options
  })
}

// POST请求
const post = (url, data = {}, options = {}) => {
  return request({
    url,
    data,
    method: 'POST',
    ...options
  })
}

// PUT请求
const put = (url, data = {}, options = {}) => {
  return request({
    url,
    data,
    method: 'PUT',
    ...options
  })
}

// DELETE请求
const del = (url, data = {}, options = {}) => {
  return request({
    url,
    data,
    method: 'DELETE',
    ...options
  })
}

export default {
  request,
  get,
  post,
  put,
  delete: del
} 