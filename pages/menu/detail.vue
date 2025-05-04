<template>
  <view class="page-container">
    <view class="container">
      <!-- 返回导航 -->
      <view class="nav-back" @tap="goBack">
        <tui-icon name="arrowleft" :size="36" color="#333"></tui-icon>
        <text class="nav-back-text">返回</text>
      </view>
      
      <!-- 加载提示 -->
      <view class="loading-box" v-if="loading">
        <tui-icon name="loading" color="#5677fc" :size="40"></tui-icon>
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 错误提示 -->
      <view class="error-box" v-else-if="loadError">
        <tui-icon name="warning" color="#ff7900" :size="80"></tui-icon>
        <text class="error-text">{{errorMsg}}</text>
        <view class="error-btn">
          <button type="primary" size="mini" @tap="loadMenuDetail">重新加载</button>
        </view>
      </view>
      
      <!-- 菜单详情内容 -->
      <view class="menu-detail" v-else>
        <view class="detail-header">
          <view class="detail-title">
            <text class="title-text">{{menuDetail.dishes}}</text>
            <view class="status-tag" :class="getStatusClass(menuDetail.status)">
              {{getStatusText(menuDetail.status)}}
            </view>
          </view>
          <view class="detail-subtitle">
            <text class="meal-type">{{menuDetail.mealType}}</text>
            <text class="menu-date">{{formatDate(menuDetail.menuDate)}}</text>
          </view>
        </view>
        
        <!-- 菜品图片 -->
        <view class="menu-image-box">
          <image :src="getFullImageUrl(menuDetail.imagePath)" mode="aspectFill" class="menu-image"></image>
        </view>
        
        <!-- 菜单信息 -->
        <view class="info-card">
          <view class="info-title">
            <tui-icon name="people" color="#5677fc" :size="32"></tui-icon>
            <text class="info-title-text">提供信息</text>
          </view>
          <view class="info-item">
            <text class="info-label">提供者：</text>
            <text class="info-value">{{menuDetail.userRealname}}</text>
          </view>
          <view class="info-item">
            <text class="info-label">日期：</text>
            <text class="info-value">{{formatDate(menuDetail.menuDate)}}</text>
          </view>
          <view class="info-item">
            <text class="info-label">餐次：</text>
            <text class="info-value">{{menuDetail.mealType}}</text>
          </view>
          <view class="info-item">
            <text class="info-label">菜品：</text>
            <text class="info-value">{{menuDetail.dishes}}</text>
          </view>
        </view>
        
        <!-- 区块链信息 -->
        <view class="info-card" v-if="menuDetail.transactionHash">
          <view class="info-title">
            <tui-icon name="shield" color="#5677fc" :size="32"></tui-icon>
            <text class="info-title-text">溯源信息</text>
          </view>
          <view class="info-item blockchain">
            <text class="info-label">区块链交易哈希：</text>
            <text class="hash-value" @tap="copyHash(menuDetail.transactionHash)">
              {{shortHash(menuDetail.transactionHash)}}
              <tui-icon name="copy" color="#5677fc" :size="26"></tui-icon>
            </text>
          </view>
        </view>
        
        <!-- 评价列表 -->
        <view class="info-card" v-if="evaluationList.length > 0">
          <view class="info-title">
            <tui-icon name="comment" color="#5677fc" :size="32"></tui-icon>
            <text class="info-title-text">评价列表</text>
            <text class="average-rating">平均: {{averageRating.toFixed(1)}}分</text>
          </view>
          
          <view class="evaluation-list">
            <view class="evaluation-item" v-for="(item, index) in evaluationList" :key="index">
              <view class="evaluation-header">
                <text class="evaluator">用户{{item.userId}}</text>
                <view class="rating-stars">
                  <tui-icon v-for="n in 5" :key="n" :name="n <= item.rating ? 'star-fill' : 'star'" 
                    :color="n <= item.rating ? '#ff9700' : '#ccc'" :size="24"></tui-icon>
                </view>
                <text class="evaluation-time">{{formatTime(item.submitTime)}}</text>
              </view>
              <view class="evaluation-content">
                {{item.comment}}
              </view>
            </view>
            
            <view class="load-more" v-if="hasMoreEvaluations" @tap="loadMoreEvaluations">
              <text>加载更多评价</text>
            </view>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="action-box">
          <button type="primary" class="action-btn" @tap="submitFeedback">
            <tui-icon name="message" color="#fff" :size="28"></tui-icon>
            提交反馈
          </button>
          <button type="default" class="action-btn" @tap="showRatingPopup" @longpress="viewAllRatings">
            <tui-icon name="star" color="#5677fc" :size="28"></tui-icon>
            评分评价
            <text class="btn-hint">(长按查看全部评价)</text>
          </button>
        </view>
        
        <!-- 查看评价和分享按钮 -->
        <view class="action-box" style="margin-top: 20rpx;">
          <button type="primary" class="action-btn" style="background-color: #ff7900;" @tap="viewAllRatings">
            <tui-icon name="comment" color="#fff" :size="28"></tui-icon>
            查看全部评价
          </button>
          <button type="default" class="action-btn" @tap="shareMenu">
            <tui-icon name="share" color="#5677fc" :size="28"></tui-icon>
            分享菜单
          </button>
        </view>
        
        <!-- 评分评价弹窗 -->
        <view class="rating-popup" v-if="showRating">
          <view class="rating-popup-mask" @tap="closeRatingPopup"></view>
          <view class="rating-popup-content">
            <view class="rating-popup-header">
              <text class="rating-popup-title">菜品评分评价</text>
              <tui-icon name="close" color="#999" :size="36" @tap="closeRatingPopup"></tui-icon>
            </view>
            
            <view class="rating-popup-body">
              <view class="rating-stars-select">
                <text class="rating-label">请选择评分：</text>
                <view class="rating-stars">
                  <tui-icon v-for="n in 5" :key="n" :name="n <= userRating ? 'star-fill' : 'star'" 
                    :color="n <= userRating ? '#ff9700' : '#ccc'" :size="40" 
                    @tap="setRating(n)"></tui-icon>
                </view>
                <text class="rating-text">{{userRating}}分</text>
              </view>
              
              <view class="comment-input">
                <text class="comment-label">评价内容：</text>
                <textarea class="comment-textarea" v-model="userComment" 
                  placeholder="请输入您对这道菜品的评价..." />
              </view>
            </view>
            
            <view class="rating-popup-footer">
              <button type="default" class="popup-btn" @tap="closeRatingPopup">取消</button>
              <button type="primary" class="popup-btn" @tap="submitRating">提交评价</button>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 添加一个固定在页面底部的查看评价浮动按钮 -->
    <view class="floating-btn" @tap="viewAllRatings">
      <tui-icon name="comment" color="#fff" :size="32"></tui-icon>
    </view>
  </view>
</template>

<script>
import { TuiIcon } from '@/utils/thorui.js'
import { getMenuDetail, getFullImageUrl } from '@/api/menu.js'
import { submitEvaluation, getMenuEvaluations, getMenuAverageRating } from '@/api/evaluation.js'
import { getUserInfo, checkLogin } from '@/utils/auth.js'

export default {
  components: {
    TuiIcon
  },
  data() {
    return {
      id: null,
      loading: true,
      loadError: false,
      errorMsg: '加载失败，请重试',
      menuDetail: {
        id: '',
        menuDate: '',
        mealType: '',
        dishes: '',
        userId: '',
        userRealname: '',
        status: '',
        imagePath: '',
        processIds: '',
        transactionHash: ''
      },
      // 评分评价相关数据
      showRating: false,
      userRating: 5,
      userComment: '',
      evaluationList: [],
      currentPage: 1,
      pageSize: 5,
      totalEvaluations: 0,
      hasMoreEvaluations: false,
      averageRating: 0
    }
  },
  onLoad(option) {
    // 页面加载，接收传递的参数
    if (option.id) {
      this.id = option.id
      this.loadMenuDetail()
    } else {
      this.loading = false
      this.loadError = true
      this.errorMsg = '未找到菜单信息'
    }
  },
  methods: {
    // 加载菜单详情
    async loadMenuDetail() {
      this.loading = true
      this.loadError = false
      
      try {
        const res = await getMenuDetail(this.id)
        if (res.code === 200 && res.data) {
          this.menuDetail = res.data
          
          // 加载评价列表和平均评分
          this.loadEvaluations()
          this.loadAverageRating()
        } else {
          this.loadError = true
          this.errorMsg = res.message || '获取菜单详情失败'
        }
      } catch (error) {
        console.error('获取菜单详情错误', error)
        this.loadError = true
        this.errorMsg = '网络错误，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    
    // 获取完整图片URL
    getFullImageUrl(path) {
      return getFullImageUrl(path)
    },
    
    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    },
    
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        '0': '待审核',
        '1': '审核中',
        '2': '已通过'
      }
      return statusMap[status] || '未知状态'
    },
    
    // 获取状态对应的样式类
    getStatusClass(status) {
      const classMap = {
        '0': 'status-pending',
        '1': 'status-processing',
        '2': 'status-approved'
      }
      return classMap[status] || ''
    },
    
    // 缩短哈希字符串
    shortHash(hash) {
      if (!hash) return ''
      return hash.substring(0, 10) + '...' + hash.substring(hash.length - 6)
    },
    
    // 复制哈希值
    copyHash(hash) {
      uni.setClipboardData({
        data: hash,
        success: () => {
          uni.showToast({
            title: '已复制到剪贴板',
            icon: 'none'
          })
        }
      })
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 提交反馈
    submitFeedback() {
      uni.showToast({
        title: '反馈功能开发中',
        icon: 'none'
      })
    },
    
    // 分享菜单
    shareMenu() {
      uni.showToast({
        title: '分享功能开发中',
        icon: 'none'
      })
    },
    
    // 显示评分弹窗
    showRatingPopup() {
      // 检查用户是否已登录
      if (!checkLogin()) return
      
      // 设置showRating为true以显示弹窗
      this.showRating = true
    },
    
    // 关闭评分弹窗
    closeRatingPopup() {
      this.showRating = false
      // 重置评分和评论
      this.userRating = 5
      this.userComment = ''
    },
    
    // 设置评分
    setRating(rating) {
      this.userRating = rating
    },
    
    // 提交评分和评价
    async submitRating() {
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
          menuId: this.id,
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
            icon: 'success'
          })
          this.closeRatingPopup()
          // 刷新评价列表
          this.currentPage = 1
          this.loadEvaluations()
          this.loadAverageRating()
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
    },
    
    // 加载评价列表
    async loadEvaluations() {
      try {
        const res = await getMenuEvaluations(this.id, this.currentPage, this.pageSize)
        
        if (res.code === 200 && res.data) {
          if (this.currentPage === 1) {
            this.evaluationList = res.data.records || []
          } else {
            this.evaluationList = [...this.evaluationList, ...(res.data.records || [])]
          }
          
          this.totalEvaluations = res.data.total || 0
          this.hasMoreEvaluations = this.evaluationList.length < this.totalEvaluations
        }
      } catch (error) {
        console.error('获取评价列表错误', error)
      }
    },
    
    // 加载更多评价
    loadMoreEvaluations() {
      this.currentPage++
      this.loadEvaluations()
    },
    
    // 获取平均评分
    async loadAverageRating() {
      try {
        const res = await getMenuAverageRating(this.id)
        
        if (res.code === 200) {
          this.averageRating = res.data || 0
        }
      } catch (error) {
        console.error('获取平均评分错误', error)
      }
    },
    
    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    },
    
    // 查看所有评价
    viewAllRatings() {
      console.log('跳转到评价列表页面，菜单ID:', this.id)
      
      // 跳转到评价列表页面，并传递菜单信息
      uni.navigateTo({
        url: `/pages/menu/ratings-list?id=${this.id}&name=${encodeURIComponent(this.menuDetail.dishes)}&date=${encodeURIComponent(this.formatDate(this.menuDetail.menuDate))}&mealType=${encodeURIComponent(this.menuDetail.mealType)}`,
        fail: (err) => {
          console.error('跳转评价列表页面失败:', err)
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none'
          })
        }
      })
    }
  }
}
</script>

<style>
.page-container {
  min-height: 100vh;
  background-color: #f8f8f8;
  box-sizing: border-box;
}

.container {
  padding: 30rpx;
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

.loading-box, .error-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400rpx;
}

.loading-text, .error-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #999;
}

.error-btn {
  margin-top: 30rpx;
}

.menu-detail {
  padding-bottom: 40rpx;
}

.detail-header {
  margin-bottom: 30rpx;
}

.detail-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.title-text {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.status-tag {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  color: #fff;
  border-radius: 6rpx;
}

.status-pending {
  background-color: #ff9700;
}

.status-processing {
  background-color: #5677fc;
}

.status-approved {
  background-color: #07c160;
}

.detail-subtitle {
  display: flex;
  align-items: center;
}

.meal-type {
  font-size: 28rpx;
  color: #5677fc;
  padding: 4rpx 12rpx;
  background-color: rgba(86, 119, 252, 0.1);
  border-radius: 6rpx;
  margin-right: 20rpx;
}

.menu-date {
  font-size: 28rpx;
  color: #666;
}

.menu-image-box {
  width: 100%;
  height: 400rpx;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.menu-image {
  width: 100%;
  height: 100%;
}

.info-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.info-title {
  display: flex;
  align-items: center;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 20rpx;
}

.info-title-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-left: 10rpx;
}

.info-item {
  display: flex;
  margin-bottom: 16rpx;
}

.info-label {
  color: #666;
  font-size: 28rpx;
  min-width: 140rpx;
}

.info-value {
  color: #333;
  font-size: 28rpx;
  flex: 1;
}

.blockchain {
  flex-direction: column;
}

.hash-value {
  margin-top: 10rpx;
  font-size: 28rpx;
  color: #5677fc;
  word-break: break-all;
  display: flex;
  align-items: center;
}

.action-box {
  display: flex;
  justify-content: space-between;
  margin-top: 40rpx;
  padding: 0 20rpx;
}

.action-btn {
  width: 45%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.evaluation-list {
  margin-top: 20rpx;
}

.evaluation-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.evaluation-item:last-child {
  border-bottom: none;
}

.evaluation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.evaluator {
  font-size: 28rpx;
  color: #666;
  font-weight: bold;
}

.rating-stars {
  display: flex;
  align-items: center;
}

.evaluation-time {
  font-size: 24rpx;
  color: #999;
}

.evaluation-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

.load-more {
  text-align: center;
  padding: 20rpx 0;
  color: #5677fc;
  font-size: 28rpx;
}

.average-rating {
  margin-left: auto;
  font-size: 28rpx;
  color: #ff9700;
  font-weight: bold;
}

/* 评分弹窗样式 */
.rating-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.rating-popup-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.rating-popup-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx;
  transform: translateY(0);
  transition: transform 0.3s;
}

.rating-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #f5f5f5;
}

.rating-popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.rating-popup-body {
  padding: 30rpx 0;
}

.rating-stars-select {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.rating-label {
  font-size: 28rpx;
  color: #333;
  margin-right: 20rpx;
}

.rating-text {
  margin-left: 20rpx;
  font-size: 28rpx;
  color: #ff9700;
}

.comment-input {
  margin-top: 20rpx;
}

.comment-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.comment-textarea {
  width: 100%;
  height: 180rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
}

.rating-popup-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 20rpx;
}

.popup-btn {
  width: 45%;
}

.floating-btn {
  position: fixed;
  bottom: 20rpx;
  right: 20rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #5677fc;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.btn-hint {
  font-size: 20rpx;
  color: #666;
  display: block;
  margin-top: 4rpx;
}
</style> 