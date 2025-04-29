<template>
  <view class="detail-overlay" v-if="visible">
    <view class="overlay-mask" @tap="handleClose"></view>
    <view class="detail-container">
      <!-- 返回导航 -->
      <view class="nav-back" @tap="handleClose">
        <tui-icon name="close" :size="36" color="#333"></tui-icon>
        <text class="nav-back-text">关闭</text>
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
        
        <!-- 质检信息卡片（新增） -->
        <view class="info-card inspection-card" @tap="goToInspectionDetail">
          <view class="info-title">
            <tui-icon name="check" color="#07c160" :size="32"></tui-icon>
            <text class="info-title-text">质检信息</text>
            <view class="go-detail">
              <text class="go-detail-text">查看详情</text>
              <tui-icon name="arrowright" color="#5677fc" :size="24"></tui-icon>
            </view>
          </view>
          <view class="inspection-summary">
            <view class="status-tag status-approved" style="display:inline-block;margin-right:10rpx;">质检已通过</view>
            <text class="inspection-date">{{formatDate(menuDetail.menuDate)}}</text>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="action-box">
          <button type="primary" class="action-btn" @tap="rateAndReview">
            <tui-icon name="star" color="#fff" :size="28"></tui-icon>
            评分评价
          </button>
          <button type="default" class="action-btn" @tap="shareMenu">
            <tui-icon name="share" color="#5677fc" :size="28"></tui-icon>
            分享菜单
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { TuiIcon } from '@/utils/thorui.js'
import { getMenuDetail, getFullImageUrl } from '@/api/menu.js'

export default {
  name: 'menu-detail',
  components: {
    TuiIcon
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    menuId: {
      type: [Number, String],
      default: ''
    },
    menuItem: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
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
      }
    }
  },
  watch: {
    visible(newVal) {
      // 当组件可见时加载详情
      if(newVal && this.menuId) {
        this.loadMenuDetail()
      } else if(newVal && this.menuItem) {
        // 如果直接传入了菜单项对象，直接使用
        this.loading = false
        this.loadError = false
        this.menuDetail = this.menuItem
      }
    },
    menuId(newVal) {
      if(newVal && this.visible) {
        this.loadMenuDetail()
      }
    },
    menuItem(newVal) {
      if(newVal && this.visible) {
        this.loading = false
        this.loadError = false
        this.menuDetail = newVal
      }
    }
  },
  mounted() {
    // 组件挂载时，如果已经可见且有ID，则加载详情
    if(this.visible && this.menuId) {
      this.loadMenuDetail()
    } else if(this.visible && this.menuItem) {
      this.loading = false
      this.loadError = false
      this.menuDetail = this.menuItem
    }
  },
  methods: {
    // 加载菜单详情
    async loadMenuDetail() {
      if(!this.menuId) return
      
      this.loading = true
      this.loadError = false
      
      try {
        const res = await getMenuDetail(this.menuId)
        if (res.code === 200 && res.data) {
          this.menuDetail = res.data
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
    
    // 关闭详情
    handleClose() {
      this.$emit('close')
    },
    
    // 评分评价
    rateAndReview() {
      uni.showToast({
        title: '评分评价功能开发中',
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
    
    // 跳转到质检详情页
    goToInspectionDetail() {
      // 关闭当前弹窗
      this.$emit('close')
      
      // 跳转到质检详情页面
      const menuId = this.menuDetail.id || this.menuId
      if (menuId) {
        // 使用绝对路径跳转
        setTimeout(() => {
          uni.navigateTo({
            url: `/pages/inspection/detail?menuId=${menuId}`,
            fail: (err) => {
              console.error('跳转失败', err)
              uni.showToast({
                title: '页面跳转失败，请重新启动应用: ' + err.errMsg,
                icon: 'none',
                duration: 3000
              })
            }
          })
        }, 300) // 延迟执行，确保弹窗已关闭
      } else {
        uni.showToast({
          title: '菜单ID不存在，无法查看质检信息',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style>
.detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.overlay-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.detail-container {
  position: relative;
  background-color: #fff;
  border-radius: 16rpx;
  width: 90%;
  max-height: 90%;
  padding: 30rpx;
  overflow-y: auto;
  z-index: 1000;
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

.inspection-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.inspection-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.go-detail {
  display: flex;
  align-items: center;
}

.go-detail-text {
  font-size: 28rpx;
  color: #5677fc;
  margin-right: 10rpx;
}
</style> 