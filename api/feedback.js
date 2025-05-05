import request from '@/utils/request.js'
import config from '@/config/config.js'

// 获取反馈列表
export function getFeedbackList(page = 1, size = 10) {
  return request.get('/api/feedbacks/page', {
    current: page,
    size: size
  })
}

// 提交反馈
export function submitFeedback(data) {
  return request.post('/api/feedbacks', data)
}

// 删除反馈
export function deleteFeedback(id) {
  return request.delete(`/api/feedbacks/${id}`)
} 