import request from '@/utils/request.js'

// 提交评价
export const submitEvaluation = (data) => {
  return request.post('/api/evaluations', data)
}

// 获取菜单的评价列表
export const getMenuEvaluations = (menuId, page = 1, size = 10) => {
  return request.get(`/api/evaluations/menu/${menuId}`, { page, size })
}

// 获取菜单的平均评分
export const getMenuAverageRating = (menuId) => {
  return request.get(`/api/evaluations/statistics/average-rating/menu/${menuId}`)
}

// 获取用户的评价列表
export const getUserEvaluations = (userId, page = 1, size = 10) => {
  return request.get(`/api/evaluations/user/${userId}`, { page, size })
}

export default {
  submitEvaluation,
  getMenuEvaluations,
  getMenuAverageRating,
  getUserEvaluations
} 