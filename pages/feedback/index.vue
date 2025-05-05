<template>
  <view class="page-container">
    <!-- 网络错误处理组件 -->
    <network-error :visible="networkError" @retry="retryLoad"></network-error>
    
    <view class="nav-back" @tap="goBack" v-if="!networkError">
      <tui-icon name="arrowleft" :size="36" color="#333"></tui-icon>
      <text class="nav-back-text">返回</text>
    </view>
    
    <view class="title-box" v-if="!networkError">
      <text class="page-title">反馈建议</text>
    </view>
    
    <!-- 加载提示 -->
    <view class="loading-box" v-if="loading && !networkError">
      <tui-icon name="loading" color="#5677fc" :size="40"></tui-icon>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 无反馈提示 -->
    <view class="empty-box" v-else-if="feedbackList.length === 0 && !networkError">
      <tui-icon name="info" color="#cccccc" :size="80"></tui-icon>
      <text class="empty-text">暂无反馈信息</text>
    </view>
    
    <!-- 反馈列表 -->
    <view class="feedback-list" v-else-if="!networkError">
      <view class="feedback-item" v-for="(item, index) in feedbackList" :key="index">
        <view class="feedback-header">
          <text class="feedback-user">匿名用户</text>
          <text class="feedback-date">{{ item.feedbackDate }}</text>
        </view>
        <view class="feedback-content">
          {{ item.content }}
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view class="load-more" v-if="hasMoreData" @tap="loadMore">
        <text v-if="!loadingMore">加载更多</text>
        <view v-else class="loading-more">
          <tui-icon name="loading" color="#5677fc" :size="24"></tui-icon>
          <text>加载中...</text>
        </view>
      </view>
      
      <view class="list-bottom" v-else>
        <text>- 已加载全部反馈 -</text>
      </view>
    </view>
    
    <!-- 提交反馈表单 -->
    <view class="feedback-form" v-if="!networkError">
      <view class="form-title">提交您的反馈</view>
      <textarea class="feedback-textarea" v-model="feedbackContent" placeholder="请输入您的反馈或建议..." maxlength="200"></textarea>
      <view class="word-count">{{ feedbackContent.length }}/200</view>
      <button class="submit-btn" type="primary" :disabled="!feedbackContent.trim()" @tap="submitFeedback">提交反馈</button>
    </view>
  </view>
</template>

<script>
import { TuiIcon } from '@/utils/thorui.js'
import { getFeedbackList, submitFeedback } from '@/api/feedback.js'
import { getUserInfo, checkLogin } from '@/utils/auth.js'
import NetworkError from '@/components/network-error/network-error.vue'

export default {
  components: {
    TuiIcon,
    NetworkError
  },
  data() {
    return {
      loading: true,
      loadingMore: false,
      feedbackList: [],
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      hasMoreData: false,
      feedbackContent: '',
      networkError: false
    }
  },
  onLoad() {
    this.loadFeedbackList()
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 加载反馈列表
    async loadFeedbackList() {
      try {
        this.loadingMore = this.currentPage > 1
        this.loading = !this.loadingMore
        this.networkError = false
        
        const res = await getFeedbackList(this.currentPage, this.pageSize)
        
        if (res.code === 200 && res.data) {
          // 如果是第一页，直接替换列表
          if (this.currentPage === 1) {
            this.feedbackList = res.data.records || []
          } else {
            // 如果是加载更多，添加到列表末尾
            this.feedbackList = [...this.feedbackList, ...(res.data.records || [])]
          }
          
          this.totalCount = res.data.total || 0
          this.hasMoreData = this.feedbackList.length < this.totalCount
        } else {
          uni.showToast({
            title: res.message || '获取反馈列表失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取反馈列表错误', error)
        this.networkError = true
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },
    
    // 重试加载
    retryLoad() {
      this.currentPage = 1
      this.loadFeedbackList()
    },
    
    // 加载更多
    loadMore() {
      if (this.hasMoreData && !this.loadingMore) {
        this.currentPage++
        this.loadFeedbackList()
      }
    },
    
    // 提交反馈
    async submitFeedback() {
      // 检查用户是否已登录
      if (!checkLogin()) return
      
      if (!this.feedbackContent.trim()) {
        uni.showToast({
          title: '请输入反馈内容',
          icon: 'none'
        })
        return
      }
      
      // 获取用户信息
      const userInfo = getUserInfo()
      if (!userInfo || !userInfo.id) {
        uni.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        })
        return
      }
      
      try {
        uni.showLoading({
          title: '提交中...'
        })
        
        const today = new Date()
        const feedbackDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
        
        const feedbackData = {
          userId: userInfo.id,
          feedbackDate: feedbackDate,
          content: this.feedbackContent.trim()
        }
        
        const res = await submitFeedback(feedbackData)
        
        if (res.code === 200) {
          uni.showToast({
            title: '反馈提交成功',
            icon: 'success'
          })
          
          // 清空输入框
          this.feedbackContent = ''
          
          // 重新加载第一页数据
          this.currentPage = 1
          this.loadFeedbackList()
        } else {
          uni.showToast({
            title: res.message || '反馈提交失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('提交反馈错误', error)
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    }
  }
}
</script>

<style>
.page-container {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding: 30rpx;
  box-sizing: border-box;
  padding-bottom: 120rpx;
}

.nav-back {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.nav-back-text {
  font-size: 32rpx;
  margin-left: 10rpx;
  color: #333;
}

.title-box {
  margin-bottom: 30rpx;
}

.page-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.loading-box, .empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 80rpx;
  padding: 60rpx 0;
}

.loading-text, .empty-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #999;
}

.feedback-list {
  margin-top: 20rpx;
}

.feedback-item {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.feedback-user {
  font-size: 28rpx;
  color: #5677fc;
  font-weight: bold;
}

.feedback-date {
  font-size: 24rpx;
  color: #999;
}

.feedback-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

.load-more {
  text-align: center;
  padding: 30rpx 0;
  color: #5677fc;
  font-size: 28rpx;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-more text {
  margin-left: 10rpx;
}

.list-bottom {
  text-align: center;
  padding: 30rpx 0;
  color: #999;
  font-size: 24rpx;
}

.feedback-form {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-top: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.form-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.feedback-textarea {
  width: 100%;
  height: 200rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.word-count {
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
  margin-bottom: 20rpx;
}

.submit-btn {
  width: 100%;
}
</style> 