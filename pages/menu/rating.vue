<template>
  <view class="page-container">
    <view class="nav-back" @tap="goBack">
      <tui-icon name="arrowleft" :size="36" color="#333"></tui-icon>
      <text class="nav-back-text">返回</text>
    </view>
    
    <view class="title-box">
      <text class="page-title">菜品评分评价</text>
    </view>
    
    <view class="menu-info">
      <view class="menu-info-item">
        <text class="menu-info-label">菜品名称：</text>
        <text class="menu-info-value">{{ menuName }}</text>
      </view>
      <view class="menu-info-item">
        <text class="menu-info-label">供应日期：</text>
        <text class="menu-info-value">{{ menuDate }}</text>
      </view>
      <view class="menu-info-item">
        <text class="menu-info-label">餐次：</text>
        <text class="menu-info-value">{{ mealType }}</text>
      </view>
    </view>
    
    <view class="rating-section">
      <text class="section-title">请选择评分：</text>
      <view class="rating-stars">
        <view 
          class="star-item" 
          v-for="(item, index) in 5" 
          :key="index"
          @tap="setRating(index + 1)"
        >
          <tui-icon 
            :name="index + 1 <= userRating ? 'star-fill' : 'star'" 
            :color="index + 1 <= userRating ? '#ff9700' : '#ccc'" 
            :size="60"
          ></tui-icon>
        </view>
      </view>
      <text class="rating-text">{{userRating}}分</text>
    </view>
    
    <view class="comment-section">
      <text class="section-title">评价内容：</text>
      <textarea 
        class="comment-textarea" 
        v-model="userComment" 
        placeholder="请输入您对这道菜品的评价..."
        maxlength="200"
      />
      <text class="comment-counter">{{userComment.length}}/200</text>
    </view>
    
    <view class="submit-section">
      <button type="primary" class="submit-btn" @tap="submitEvaluation">提交评价</button>
    </view>
  </view>
</template>

<script>
import { TuiIcon } from '@/utils/thorui.js'
import { submitEvaluation } from '@/api/evaluation.js'
import { getUserInfo, checkLogin } from '@/utils/auth.js'

export default {
  components: {
    TuiIcon
  },
  data() {
    return {
      menuId: '',
      menuName: '',
      menuDate: '',
      mealType: '',
      userRating: 5,
      userComment: ''
    }
  },
  onLoad(option) {
    if (!checkLogin()) {
      uni.navigateBack()
      return
    }
    
    if (option) {
      this.menuId = option.id || ''
      this.menuName = option.name || ''
      this.menuDate = option.date || ''
      this.mealType = option.mealType || ''
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 设置评分
    setRating(rating) {
      this.userRating = rating
    },
    
    // 提交评价
    async submitEvaluation() {
      if (!this.menuId) {
        uni.showToast({
          title: '菜单ID不存在',
          icon: 'none'
        })
        return
      }
      
      if (!this.userRating) {
        uni.showToast({
          title: '请选择评分',
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
          title: '提交中...',
          mask: true
        })
        
        const evaluationData = {
          menuId: this.menuId,
          userId: userInfo.id,
          rating: this.userRating,
          commentContent: this.userComment || `给了${this.userRating}星评价`
        }
        
        console.log('提交评价数据:', evaluationData)
        
        const res = await submitEvaluation(evaluationData)
        
        uni.hideLoading()
        
        if (res.code === 200) {
          uni.showToast({
            title: '评价提交成功',
            icon: 'success',
            duration: 1500
          })
          
          // 返回上一页
          setTimeout(() => {
            // 设置上一页需要刷新
            const pages = getCurrentPages()
            if (pages.length > 1) {
              // 获取上一页页面实例
              const prevPage = pages[pages.length - 2]
              // 如果上一页有loadEvaluationList方法，调用它刷新数据
              if (prevPage && prevPage.$vm && typeof prevPage.$vm.loadEvaluationList === 'function') {
                prevPage.$vm.currentPage = 1
                prevPage.$vm.loadEvaluationList()
                console.log('通知上一页刷新评价列表')
              }
            }
            
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: res.message || '评价提交失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('提交评价错误', error)
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
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
  margin-bottom: 40rpx;
}

.page-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.menu-info {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx 30rpx;
  margin-bottom: 30rpx;
}

.menu-info-item {
  display: flex;
  padding: 10rpx 0;
}

.menu-info-label {
  color: #666;
  font-size: 28rpx;
  width: 160rpx;
}

.menu-info-value {
  color: #333;
  font-size: 28rpx;
  font-weight: bold;
  flex: 1;
}

.rating-section {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.section-title {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 20rpx;
  align-self: flex-start;
}

.rating-stars {
  display: flex;
  justify-content: center;
  margin: 20rpx 0;
}

.star-item {
  margin: 0 10rpx;
}

.rating-text {
  font-size: 36rpx;
  color: #ff9700;
  font-weight: bold;
  margin-top: 10rpx;
}

.comment-section {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.comment-textarea {
  width: 100%;
  height: 200rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  margin-top: 20rpx;
}

.comment-counter {
  font-size: 24rpx;
  color: #999;
  text-align: right;
  display: block;
  margin-top: 10rpx;
}

.submit-section {
  margin-top: 60rpx;
}

.submit-btn {
  height: 90rpx;
  line-height: 90rpx;
  font-size: 32rpx;
  font-weight: bold;
}
</style> 