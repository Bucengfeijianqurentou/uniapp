<template>
  <view class="page-container">
    <view class="nav-back" @tap="goBack">
      <tui-icon name="arrowleft" :size="36" color="#333"></tui-icon>
      <text class="nav-back-text">返回</text>
    </view>
    
    <!-- 网络错误处理组件 -->
    <network-error :visible="networkError" @retry="retryLoad"></network-error>
    
    <!-- 加载提示 -->
    <view class="loading-box" v-if="loading && !networkError">
      <tui-icon name="loading" color="#5677fc" :size="40"></tui-icon>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 文章详情 -->
    <view class="post-detail" v-else-if="!networkError && postDetail">
      <!-- 文章标题 -->
      <view class="post-title">
        <text>{{ postDetail.title }}</text>
      </view>
      
      <!-- 文章元信息 -->
      <view class="post-meta">
        <text class="post-author">{{ postDetail.authorName }}</text>
        <text class="post-time">{{ formatTime(postDetail.publishTime) }}</text>
      </view>
      
      <!-- 文章标签 -->
      <view class="post-tags" v-if="postDetail.tags && postDetail.tags.length > 0">
        <view class="tag" v-for="(tag, index) in postDetail.tags" :key="index">{{ tag }}</view>
      </view>
      
      <!-- 文章内容 -->
      <view class="post-content">
        <text>{{ postDetail.content }}</text>
      </view>
      
      <!-- 文章统计 -->
      <view class="post-stats">
        <view class="stat-item">
          <tui-icon name="eye" color="#999" :size="24"></tui-icon>
          <text>{{ postDetail.viewCount }}</text>
        </view>
        <view class="stat-item">
          <tui-icon name="message" color="#999" :size="24"></tui-icon>
          <text>{{ postDetail.commentCount }}</text>
        </view>
      </view>
      
      <!-- 分割线 -->
      <view class="divider"></view>
      
      <!-- 评论区标题 -->
      <view class="comments-title">
        <text>评论 ({{ commentsList.length }})</text>
      </view>
      
      <!-- 评论列表 -->
      <view class="comments-list" v-if="commentsList.length > 0">
        <view class="comment-item" v-for="(comment, index) in commentsList" :key="index">
          <view class="comment-header">
            <text class="comment-author">匿名用户</text>
            <text class="comment-time">{{ formatTime(comment.createTime) }}</text>
          </view>
          <view class="comment-content">
            <text>{{ comment.content }}</text>
          </view>
        </view>
        
        <!-- 加载更多评论 -->
        <view class="load-more" v-if="hasMoreComments" @tap="loadMoreComments">
          <text v-if="!loadingComments">加载更多评论</text>
          <view v-else class="loading-more">
            <tui-icon name="loading" color="#5677fc" :size="24"></tui-icon>
            <text>加载中...</text>
          </view>
        </view>
        
        <view class="comments-bottom" v-else>
          <text>- 已加载全部评论 -</text>
        </view>
      </view>
      
      <!-- 无评论提示 -->
      <view class="no-comments" v-else>
        <text>暂无评论，快来发表你的看法吧</text>
      </view>
    </view>
    
    <!-- 评论输入框 -->
    <view class="comment-input-container" v-if="!networkError && !loading">
      <input 
        type="text" 
        class="comment-input" 
        v-model="commentContent" 
        placeholder="说说你的看法..." 
        confirm-type="send" 
        @confirm="submitComment"
      />
      <button 
        class="send-btn" 
        type="primary" 
        size="mini" 
        :disabled="!commentContent.trim()" 
        @tap="submitComment"
      >发送</button>
    </view>
  </view>
</template>

<script>
import { TuiIcon } from '@/utils/thorui.js'
import { getPostDetail, getComments, publishComment, getMockPostDetail, getMockComments } from '@/api/community.js'
import { getUserInfo, checkLogin } from '@/utils/auth.js'
import NetworkError from '@/components/network-error/network-error.vue'

export default {
  components: {
    TuiIcon,
    NetworkError
  },
  data() {
    return {
      postId: '',
      loading: true,
      networkError: false,
      postDetail: null,
      commentsList: [],
      commentContent: '',
      currentPage: 1,
      pageSize: 10,
      totalComments: 0,
      hasMoreComments: false,
      loadingComments: false
    }
  },
  onLoad(option) {
    if (option && option.id) {
      this.postId = option.id
      this.loadPostDetail()
      this.loadComments()
    } else {
      uni.showToast({
        title: '参数错误',
        icon: 'none'
      })
      setTimeout(() => {
        this.goBack()
      }, 1500)
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 重试加载
    retryLoad() {
      this.loadPostDetail()
      this.loadComments()
    },
    
    // 加载文章详情
    async loadPostDetail() {
      try {
        this.loading = true
        this.networkError = false
        
        // 实际开发中取消注释下面的代码，获取真实数据
        // const res = await getPostDetail(this.postId)
        
        // 使用模拟数据
        const res = getMockPostDetail(this.postId)
        
        if (res.code === 200 && res.data) {
          this.postDetail = res.data
        } else {
          uni.showToast({
            title: res.message || '获取文章详情失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取文章详情错误', error)
        this.networkError = true
      } finally {
        this.loading = false
      }
    },
    
    // 加载评论列表
    async loadComments() {
      try {
        this.loadingComments = true
        
        // 实际开发中取消注释下面的代码，获取真实数据
        // const res = await getComments(this.postId, this.currentPage, this.pageSize)
        
        // 使用模拟数据
        const res = getMockComments(this.postId)
        
        if (res.code === 200 && res.data) {
          // 如果是第一页，直接替换列表
          if (this.currentPage === 1) {
            this.commentsList = res.data.records || []
          } else {
            // 如果是加载更多，添加到列表末尾
            this.commentsList = [...this.commentsList, ...(res.data.records || [])]
          }
          
          this.totalComments = res.data.total || 0
          this.hasMoreComments = this.commentsList.length < this.totalComments
        } else {
          uni.showToast({
            title: res.message || '获取评论失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取评论错误', error)
      } finally {
        this.loadingComments = false
      }
    },
    
    // 加载更多评论
    loadMoreComments() {
      if (this.hasMoreComments && !this.loadingComments) {
        this.currentPage++
        this.loadComments()
      }
    },
    
    // 提交评论
    async submitComment() {
      // 检查用户是否已登录
      if (!checkLogin()) return
      
      if (!this.commentContent.trim()) {
        uni.showToast({
          title: '请输入评论内容',
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
        
        const commentData = {
          userId: userInfo.id,
          content: this.commentContent.trim()
        }
        
        // 实际开发中取消注释下面的代码，调用真实接口
        // const res = await publishComment(this.postId, commentData)
        
        // 模拟提交成功
        const res = {
          code: 200,
          message: '操作成功'
        }
        
        if (res.code === 200) {
          uni.showToast({
            title: '评论成功',
            icon: 'success'
          })
          
          // 清空输入框
          this.commentContent = ''
          
          // 重新加载第一页评论
          this.currentPage = 1
          this.loadComments()
          
          // 更新文章评论数
          if (this.postDetail) {
            this.postDetail.commentCount = (this.postDetail.commentCount || 0) + 1
          }
        } else {
          uni.showToast({
            title: res.message || '评论失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('提交评论错误', error)
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return ''
      
      const now = new Date()
      const publishTime = new Date(timeStr)
      const diffMs = now - publishTime
      
      // 一小时内
      if (diffMs < 3600000) {
        const minutes = Math.floor(diffMs / 60000)
        return `${minutes}分钟前`
      }
      
      // 一天内
      if (diffMs < 86400000) {
        const hours = Math.floor(diffMs / 3600000)
        return `${hours}小时前`
      }
      
      // 三天内
      if (diffMs < 259200000) {
        const days = Math.floor(diffMs / 86400000)
        return `${days}天前`
      }
      
      // 超过三天显示日期
      return `${publishTime.getFullYear()}-${(publishTime.getMonth() + 1).toString().padStart(2, '0')}-${publishTime.getDate().toString().padStart(2, '0')}`
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
  padding-bottom: 130rpx;
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

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 80rpx;
  padding: 60rpx 0;
}

.loading-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #999;
}

.post-detail {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.post-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20rpx;
}

.tag {
  display: inline-block;
  padding: 6rpx 16rpx;
  margin-right: 16rpx;
  margin-bottom: 10rpx;
  font-size: 24rpx;
  color: #666;
  background-color: #f0f0f0;
  border-radius: 30rpx;
}

.post-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
  margin-bottom: 30rpx;
  white-space: pre-wrap;
}

.post-stats {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  margin-left: 20rpx;
  font-size: 24rpx;
  color: #999;
}

.stat-item text {
  margin-left: 4rpx;
}

.divider {
  height: 1rpx;
  background-color: #e0e0e0;
  margin: 30rpx 0;
}

.comments-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.comments-list {
  margin-top: 20rpx;
}

.comment-item {
  border-bottom: 1rpx solid #f0f0f0;
  padding: 20rpx 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.comment-author {
  font-size: 28rpx;
  color: #5677fc;
  font-weight: bold;
}

.comment-time {
  font-size: 24rpx;
  color: #999;
}

.comment-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
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

.comments-bottom {
  text-align: center;
  padding: 30rpx 0;
  color: #999;
  font-size: 24rpx;
}

.no-comments {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 28rpx;
}

.comment-input-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.comment-input {
  flex: 1;
  height: 80rpx;
  background-color: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
}

.send-btn {
  margin-left: 20rpx;
}
</style> 