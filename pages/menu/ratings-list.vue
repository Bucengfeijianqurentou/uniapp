<template>
  <view class="page-container">
    <view class="nav-back" @tap="goBack">
      <tui-icon name="arrowleft" :size="36" color="#333"></tui-icon>
      <text class="nav-back-text">返回</text>
    </view>
    
    <view class="title-box">
      <text class="page-title">评价列表</text>
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
      <view class="menu-info-item" v-if="averageRating > 0">
        <text class="menu-info-label">平均评分：</text>
        <text class="menu-info-value rating-value">{{ averageRating.toFixed(1) }}分</text>
      </view>
    </view>
    
    <!-- 加载提示 -->
    <view class="loading-box" v-if="loading">
      <tui-icon name="loading" color="#5677fc" :size="40"></tui-icon>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 无评价提示 -->
    <view class="empty-box" v-else-if="evaluationList.length === 0">
      <tui-icon name="comment-fill" color="#cccccc" :size="80"></tui-icon>
      <text class="empty-text">暂无评价</text>
      <button type="primary" size="mini" class="rating-btn" @tap="goToRate">去评价</button>
    </view>
    
    <!-- 评价列表 -->
    <view class="evaluation-list" v-else>
      <view class="evaluation-item" v-for="(item, index) in evaluationList" :key="index">
        <view class="evaluation-header">
          <text class="evaluator">{{ getUserDisplayName(item) }}</text>
          <view class="evaluation-time">{{ formatTime(item.submitTime || item.createTime) }}</view>
        </view>
        
        <view class="rating-stars">
          <tui-icon v-for="n in 5" :key="n" :name="n <= item.rating ? 'star-fill' : 'star'" 
            :color="n <= item.rating ? '#ff9700' : '#ccc'" :size="36"></tui-icon>
          <text class="rating-text">{{ item.rating }}分</text>
        </view>
        
        <view class="evaluation-content" v-if="item.commentContent || item.comment">
          {{ item.commentContent || item.comment }}
        </view>
        <view class="evaluation-content empty-comment" v-else>
          该用户未填写评价内容
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
        <text>- 已加载全部评价 -</text>
      </view>
    </view>
    
    <!-- 底部操作按钮 -->
    <view class="bottom-button" v-if="!loading">
      <button type="primary" class="rating-action-btn" @tap="goToRate">
        <tui-icon name="star" color="#fff" :size="28"></tui-icon>
        我要评价
      </button>
    </view>
  </view>
</template>

<script>
import { TuiIcon } from '@/utils/thorui.js'
import { getMenuEvaluations, getMenuAverageRating } from '@/api/evaluation.js'
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
      loading: true,
      loadingMore: false,
      evaluationList: [],
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      hasMoreData: false,
      averageRating: 0
    }
  },
  onLoad(option) {
    if (option) {
      this.menuId = option.id || ''
      this.menuName = option.name || ''
      this.menuDate = option.date || ''
      this.mealType = option.mealType || ''
      
      this.loadEvaluationList()
      this.loadAverageRating()
    } else {
      this.loading = false
      uni.showToast({
        title: '参数错误',
        icon: 'none'
      })
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 加载评价列表
    async loadEvaluationList() {
      if (!this.menuId) return
      
      try {
        this.loadingMore = this.currentPage > 1
        
        console.log(`正在加载菜单ID:${this.menuId}的评价，页码:${this.currentPage}`)
        const res = await getMenuEvaluations(this.menuId, this.currentPage, this.pageSize)
        
        if (res.code === 200 && res.data) {
          console.log('获取评价数据成功:', res.data)
          
          // 如果是第一页，直接替换列表
          if (this.currentPage === 1) {
            this.evaluationList = res.data.records || []
          } else {
            // 如果是加载更多，添加到列表末尾
            this.evaluationList = [...this.evaluationList, ...(res.data.records || [])]
          }
          
          this.totalCount = res.data.total || 0
          this.hasMoreData = this.evaluationList.length < this.totalCount
          
          // 打印评价数据的第一条记录，以便查看字段格式
          if (this.evaluationList.length > 0) {
            console.log('第一条评价数据的字段:',  JSON.stringify(this.evaluationList[0]))
          }
        } else {
          console.error('获取评价列表失败:', res)
          uni.showToast({
            title: res.message || '获取评价列表失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取评价列表错误', error)
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },
    
    // 加载更多
    loadMore() {
      if (this.hasMoreData && !this.loadingMore) {
        this.currentPage++
        this.loadEvaluationList()
      }
    },
    
    // 获取菜单平均评分
    async loadAverageRating() {
      if (!this.menuId) return
      
      try {
        const res = await getMenuAverageRating(this.menuId)
        
        if (res.code === 200) {
          this.averageRating = res.data || 0
        }
      } catch (error) {
        console.error('获取平均评分错误', error)
      }
    },
    
    // 获取用户显示名称
    getUserDisplayName(item) {
      return '匿名用户'
    },
    
    // 跳转到评价页面
    goToRate() {
      if (!checkLogin()) return
      
      uni.navigateTo({
        url: `/pages/menu/rating?id=${this.menuId}&name=${encodeURIComponent(this.menuName)}&date=${encodeURIComponent(this.menuDate)}&mealType=${encodeURIComponent(this.mealType)}`
      })
    },
    
    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
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

.menu-info {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
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

.rating-value {
  color: #ff9700;
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

.rating-btn {
  margin-top: 30rpx;
}

.evaluation-list {
  margin-top: 20rpx;
}

.evaluation-item {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.evaluation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.evaluator {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
}

.evaluation-time {
  font-size: 24rpx;
  color: #999;
}

.rating-stars {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.rating-text {
  margin-left: 20rpx;
  font-size: 30rpx;
  color: #ff9700;
  font-weight: bold;
}

.evaluation-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

.empty-comment {
  color: #999;
  font-style: italic;
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

.bottom-button {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 30rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.rating-action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 