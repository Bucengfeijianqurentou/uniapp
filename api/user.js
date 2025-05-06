import { getAuthHeader } from '@/utils/auth.js';
import request from '@/utils/request.js'
import config from '@/config/config.js'

// 用户登录
export function login(data) {
  return request.post('/api/user/login', {
    ...data,
    role: 'STUDENT_PARENT' // 固定角色
  })
}

// 获取用户信息
export function getUserDetail(userId) {
  return request.get(`/api/user/${userId}`)
}

// 更新用户信息
export function updateUserInfo(userId, data) {
  return request.put(`/api/user/${userId}`, data)
}

// 修改密码
export function changePassword(data) {
  return request.post('/api/user/changePassword', data)
}

export default {
  login,
  getUserDetail,
  updateUserInfo,
  changePassword
} 