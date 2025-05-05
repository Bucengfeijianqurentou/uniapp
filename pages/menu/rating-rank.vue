<template>
  <view class="page-container">
    <!-- 页面标题 -->
    <view class="header">
      <view class="nav-back" @tap="goBack">
        <tui-icon name="arrowleft" :size="36" color="#fff"></tui-icon>
        <text class="nav-back-text">返回</text>
      </view>
      <view class="page-title">
        <text>评分榜单</text>
      </view>
      <view class="sub-title">
        <text>根据学生和家长的评分推荐最受欢迎的菜品</text>
      </view>
    </view>
    
    <!-- 加载提示 -->
    <view class="loading-box" v-if="loading">
      <tui-icon name="loading" color="#5677fc" :size="40"></tui-icon>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 空数据提示 -->
    <view class="empty-box" v-else-if="menuList.length === 0">
      <tui-icon name="info" color="#999" :size="80"></tui-icon>
      <text class="empty-text">暂无评分数据</text>
    </view>
    
    <view class="rank-container" v-else>
      <!-- 第一名 -->
      <view class="top-card first-place" v-if="menuList.length > 0" @tap="showMenuDetail(menuList[0])">
        <image class="dish-image" :src="getFullImageUrl(menuList[0].imagePath)" mode="aspectFill"></image>
        <view class="dish-info">
          <text class="dish-name">{{ menuList[0].dishes }}</text>
          <view class="stars-row">
            <tui-icon v-for="n in 5" :key="n" name="star-fill" :color="n <= Math.floor(menuList[0].avgRating) ? '#ffcc00' : '#e0e0e0'" :size="28"></tui-icon>
          </view>
          <text class="rating-number">{{ formatRating(menuList[0].avgRating) }}</text>
        </view>
      </view>
      
      <!-- 第二、三名 -->
      <view class="runner-up-row">
        <!-- 第二名 -->
        <view class="rank-card second-place" v-if="menuList.length > 1" @tap="showMenuDetail(menuList[1])">
          <view class="rank-badge">2</view>
          <image class="dish-image" :src="getFullImageUrl(menuList[1].imagePath)" mode="aspectFill"></image>
          <view class="dish-info">
            <text class="dish-name">{{ menuList[1].dishes }}</text>
            <view class="stars-row">
              <tui-icon v-for="n in 5" :key="n" name="star-fill" :color="n <= Math.floor(menuList[1].avgRating) ? '#ffcc00' : '#e0e0e0'" :size="24"></tui-icon>
            </view>
            <text class="rating-number">{{ formatRating(menuList[1].avgRating) }}</text>
          </view>
        </view>
        
        <!-- 第三名 -->
        <view class="rank-card third-place" v-if="menuList.length > 2" @tap="showMenuDetail(menuList[2])">
          <view class="rank-badge">3</view>
          <image class="dish-image" :src="getFullImageUrl(menuList[2].imagePath)" mode="aspectFill"></image>
          <view class="dish-info">
            <text class="dish-name">{{ menuList[2].dishes }}</text>
            <view class="stars-row">
              <tui-icon v-for="n in 5" :key="n" name="star-fill" :color="n <= Math.floor(menuList[2].avgRating) ? '#ffcc00' : '#e0e0e0'" :size="24"></tui-icon>
            </view>
            <text class="rating-number">{{ formatRating(menuList[2].avgRating) }}</text>
          </view>
        </view>
      </view>
      
      <!-- 其他排名列表 -->
      <view class="other-ranks" v-if="menuList.length > 3">
        <view class="section-title">其他菜品排名</view>
        
        <view class="rank-list">
          <view class="rank-item" v-for="(item, index) in menuList.slice(3)" :key="item.id" @tap="showMenuDetail(item)">
            <view class="rank-number">{{ index + 4 }}</view>
            <image class="item-image" :src="getFullImageUrl(item.imagePath)" mode="aspectFill"></image>
            <view class="item-content">
              <text class="item-name">{{ item.dishes }}</text>
              <view class="item-rating">
                <tui-icon v-for="n in 5" :key="n" name="star-fill" :color="n <= Math.floor(item.avgRating) ? '#ffcc00' : '#e0e0e0'" :size="20"></tui-icon>
                <text class="item-score">{{ formatRating(item.avgRating) }}</text>
              </view>
            </view>
            <text class="meal-type">{{ item.mealType }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 详情组件 -->
    <menu-detail :visible="showDetailModal" :menuItem="currentMenu" @close="closeDetail"></menu-detail>
  </view>
</template>

<script>
import {
  TuiIcon
} from '@/utils/thorui.js'
import {
  getFullImageUrl
} from '@/api/menu.js'
import {
  getMenuRatingRanking
} from '@/api/evaluation.js'
import MenuDetail from '@/components/menu-detail/menu-detail.vue'
import {
  checkLogin
} from '@/utils/auth.js'

export default {
  components: {
    TuiIcon,
    MenuDetail
  },
  data() {
    return {
      loading: true,
      menuList: [],
      page: 1,
      size: 20,
      total: 0,
      showDetailModal: false,
      currentMenu: null
    }
  },
  onLoad() {
    // 检查登录状态
    if (!checkLogin()) {
      return
    }
    
    // 获取评分排行数据
    this.fetchRatingRank()
  },
  methods: {
    // 获取排行榜数据
    async fetchRatingRank() {
      this.loading = true
      try {
        const res = await getMenuRatingRanking(this.page, this.size)
        if (res.code === 200 && res.data) {
          this.menuList = res.data.records
          this.total = res.data.total
        } else {
          uni.showToast({
            title: res.message || '获取排行榜失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取排行榜错误', error)
        uni.showToast({
          title: '获取排行榜失败，请稍后重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 格式化评分，保留一位小数
    formatRating(rating) {
      return rating ? rating.toFixed(1) : '0.0'
    },
    
    // 获取完整图片URL
    getFullImageUrl(path) {
      return getFullImageUrl(path)
    },
    
    // 显示菜单详情
    showMenuDetail(menu) {
      this.currentMenu = menu
      this.showDetailModal = true
    },
    
    // 关闭详情弹窗
    closeDetail() {
      this.showDetailModal = false
      this.currentMenu = null
    }
  }
}
</script>

<style>
.page-container {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding-bottom: 40rpx;
}

.header {
  padding: 30rpx 30rpx 40rpx;
  background-color: #5677fc;
}

.nav-back {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.nav-back-text {
  font-size: 30rpx;
  margin-left: 10rpx;
  color: #fff;
}

.page-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8rpx;
}

.sub-title {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* 加载和空数据提示 */
.loading-box, .empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-text, .empty-text {
  font-size: 28rpx;
  color: #999;
  margin-top: 20rpx;
}

.rank-container {
  padding: 0 30rpx;
}

/* 第一名样式 */
.top-card {
  margin-top: 20rpx;
  border-radius: 16rpx;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.first-place {
  border: 3rpx solid #FFD700;
}

.dish-image {
  width: 100%;
  height: 340rpx;
  display: block;
  object-fit: cover;
}

.dish-info {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dish-name {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.stars-row {
  display: flex;
  margin-bottom: 8rpx;
}

.rating-number {
  font-size: 36rpx;
  color: #FF8C00;
  font-weight: bold;
}

/* 第二、三名样式 */
.runner-up-row {
  display: flex;
  justify-content: space-between;
  margin-top: 20rpx;
}

.rank-card {
  width: 330rpx;
  border-radius: 16rpx;
  background: #fff;
  overflow: hidden;
  position: relative;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.second-place {
  border: 2rpx solid #90a4ae;
}

.third-place {
  border: 2rpx solid #cd7f32;
}

.rank-badge {
  position: absolute;
  top: 10rpx;
  left: 10rpx;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-weight: bold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  z-index: 1;
}

.rank-card .dish-image {
  height: 180rpx;
}

.rank-card .dish-name {
  font-size: 26rpx;
}

.rank-card .rating-number {
  font-size: 30rpx;
}

/* 其他排名样式 */
.other-ranks {
  margin-top: 40rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.section-title {
  padding: 20rpx;
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  border-bottom: 1rpx solid #f0f0f0;
}

.rank-list {
  padding: 0 20rpx;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.rank-item:last-child {
  border-bottom: none;
}

.rank-number {
  width: 40rpx;
  height: 40rpx;
  background: #f5f7fa;
  color: #666;
  font-weight: bold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  margin-right: 20rpx;
}

.item-image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
  object-fit: cover;
}

.item-content {
  flex: 1;
  overflow: hidden;
}

.item-name {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.item-rating {
  display: flex;
  align-items: center;
}

.item-score {
  font-size: 26rpx;
  color: #FF8C00;
  font-weight: bold;
  margin-left: 10rpx;
}

.meal-type {
  font-size: 22rpx;
  color: #5677fc;
  background: rgba(86, 119, 252, 0.1);
  border-radius: 20rpx;
  padding: 4rpx 12rpx;
  margin-left: 10rpx;
}
</style> 