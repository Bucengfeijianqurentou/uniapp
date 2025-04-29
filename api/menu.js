import request from '@/utils/request.js'
import config from '@/config/config.js'

// 获取菜单列表
export const getMenuList = (params) => {
  return request.get('/api/menu', params)
}

// 获取菜单详情
export const getMenuDetail = (id) => {
  return request.get(`/api/menu/${id}`)
}

// 获取完整图片路径
export const getFullImageUrl = (imagePath) => {
  if (!imagePath) return ''
  // 如果图片路径已经是完整URL，则直接返回
  if (imagePath.startsWith('http')) return imagePath
  // 否则拼接基础URL
  return config.imageBaseUrl + imagePath
}

export default {
  getMenuList,
  getMenuDetail,
  getFullImageUrl
} 