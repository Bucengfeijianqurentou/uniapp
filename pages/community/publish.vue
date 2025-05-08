<template>
  <view class="page-container">
    <view class="nav-back" @tap="goBack">
      <tui-icon name="arrowleft" :size="36" color="#333"></tui-icon>
      <text class="nav-back-text">返回</text>
    </view>
    
    <view class="title-box">
      <text class="page-title">发布帖子</text>
    </view>
    
    <!-- 发布表单 -->
    <view class="publish-form">
      <!-- 标题输入 -->
      <view class="form-item">
        <text class="form-label">标题</text>
        <input 
          class="title-input" 
          v-model="postTitle" 
          placeholder="请输入标题（5-30字）" 
          maxlength="30"
        />
      </view>
      
      <!-- 内容输入 -->
      <view class="form-item">
        <text class="form-label">内容</text>
        <textarea 
          class="content-textarea" 
          v-model="postContent" 
          placeholder="请输入帖子内容（10-500字）" 
          maxlength="500"
        />
        <view class="word-count">{{ postContent.length }}/500</view>
      </view>
      
      <!-- 标签选择 -->
      <view class="form-item">
        <text class="form-label">标签 <text class="sub-label">（至少选择1个标签）</text></text>
        <view class="tags-box">
          <view 
            class="tag" 
            :class="{ active: selectedTags.includes(tag) }"
            v-for="(tag, index) in availableTags" 
            :key="index"
            @tap="toggleTag(tag)"
          >{{ tag }}</view>
        </view>
      </view>
      
      <!-- 提交按钮 -->
      <button 
        class="submit-btn" 
        type="primary" 
        :disabled="!isFormValid" 
        @tap="submitPost"
      >发布</button>
    </view>
  </view>
</template>

<script>
import { TuiIcon } from '@/utils/thorui.js'
import { getUserInfo, checkLogin } from '@/utils/auth.js'
import { publishPost } from '@/api/community.js'

export default {
  components: {
    TuiIcon
  },
  data() {
    return {
      postTitle: '',
      postContent: '',
      selectedTags: [],
      availableTags: ['建议', '分享', '求助', '感谢', '经验分享', '健康饮食', '营养均衡', '传统文化', '伙食改善', '挑食'],
      submitting: false
    }
  },
  computed: {
    isFormValid() {
      return (
        this.postTitle.trim().length >= 5 && 
        this.postContent.trim().length >= 10 && 
        this.selectedTags.length > 0 &&
        !this.submitting
      )
    }
  },
  onLoad() {
    // 检查用户是否已登录
    if (!checkLogin()) {
      uni.navigateBack()
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 切换标签选择
    toggleTag(tag) {
      const index = this.selectedTags.indexOf(tag)
      if (index === -1) {
        // 最多选择3个标签
        if (this.selectedTags.length < 3) {
          this.selectedTags.push(tag)
        } else {
          uni.showToast({
            title: '最多选择3个标签',
            icon: 'none'
          })
        }
      } else {
        this.selectedTags.splice(index, 1)
      }
    },
    
    // 提交帖子
    async submitPost() {
      if (!this.isFormValid) return
      
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
        this.submitting = true
        uni.showLoading({
          title: '发布中...'
        })
        
        // 构建帖子数据
        const currentTime = new Date()
        const formattedTime = `${currentTime.getFullYear()}-${(currentTime.getMonth() + 1).toString().padStart(2, '0')}-${currentTime.getDate().toString().padStart(2, '0')} ${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}:${currentTime.getSeconds().toString().padStart(2, '0')}`
        
        const postData = {
          title: this.postTitle.trim(),
          content: this.postContent.trim(),
          authorId: userInfo.id,
          authorName: userInfo.realName || '张爸爸',
          publishTime: formattedTime,
          tags: [...this.selectedTags]
        }
        
        // 在实际应用中，这里应该调用API发送到服务器
        // const res = await publishPost(postData)
        
        // 模拟发送成功
        const res = {
          code: 200,
          message: '操作成功',
          data: {
            id: Math.floor(Math.random() * 1000) + 100, // 随机ID
            viewCount: 0,
            commentCount: 0,
            ...postData
          }
        }
        
        if (res.code === 200) {
          // 缓存新发布的帖子，用于在列表页显示
          try {
            // 获取已有的缓存
            const cachedPosts = uni.getStorageSync('community_cached_posts') || []
            
            // 将新帖子添加到列表最前面
            cachedPosts.unshift(res.data)
            
            // 保存回缓存
            uni.setStorageSync('community_cached_posts', cachedPosts)
          } catch (e) {
            console.error('缓存帖子失败', e)
          }
          
          uni.showToast({
            title: '发布成功',
            icon: 'success'
          })
          
          // 跳转回列表页
          setTimeout(() => {
            this.goBack()
          }, 1500)
        } else {
          uni.showToast({
            title: res.message || '发布失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('发布帖子错误', error)
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      } finally {
        this.submitting = false
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

.publish-form {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.sub-label {
  font-size: 24rpx;
  color: #999;
  font-weight: normal;
}

.title-input {
  width: 100%;
  height: 90rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 30rpx;
  color: #333;
  box-sizing: border-box;
}

.content-textarea {
  width: 100%;
  height: 400rpx;
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
}

.tags-box {
  display: flex;
  flex-wrap: wrap;
}

.tag {
  display: inline-block;
  padding: 12rpx 24rpx;
  margin-right: 20rpx;
  margin-bottom: 20rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #f0f0f0;
  border-radius: 30rpx;
}

.tag.active {
  color: #fff;
  background-color: #5677fc;
}

.submit-btn {
  margin-top: 40rpx;
  height: 90rpx;
  line-height: 90rpx;
  font-size: 32rpx;
  font-weight: bold;
}
</style> 