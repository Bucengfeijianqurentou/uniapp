<template>
  <view class="page-container">
    <view class="nav-back" @tap="goBack">
      <tui-icon name="arrowleft" :size="36" color="#333"></tui-icon>
      <text class="nav-back-text">返回</text>
    </view>
    
    <view class="title-box">
      <text class="page-title">家长社区</text>
    </view>
    
    <!-- 社区简介 -->
    <view class="community-intro">
      <text>欢迎来到家长社区，这里是家长们交流分享的平台。您可以查看其他家长的分享，也可以发布自己的观点和建议。</text>
    </view>
    
    <!-- 搜索框 -->
    <view class="search-box">
      <tui-icon name="search" color="#999" :size="32"></tui-icon>
      <input type="text" placeholder="搜索帖子" v-model="searchText" @input="handleSearch" />
    </view>
    
    <!-- 分类标签 -->
    <view class="category-tags">
      <view class="tag" :class="{ active: activeTag === 'all' }" @tap="filterByTag('all')">全部</view>
      <view class="tag" :class="{ active: activeTag === '建议' }" @tap="filterByTag('建议')">建议</view>
      <view class="tag" :class="{ active: activeTag === '分享' }" @tap="filterByTag('分享')">分享</view>
      <view class="tag" :class="{ active: activeTag === '求助' }" @tap="filterByTag('求助')">求助</view>
      <view class="tag" :class="{ active: activeTag === '感谢' }" @tap="filterByTag('感谢')">感谢</view>
    </view>
    
    <!-- 网络错误处理组件 -->
    <network-error :visible="networkError" @retry="retryLoad"></network-error>
    
    <!-- 加载提示 -->
    <view class="loading-box" v-if="loading && !networkError">
      <tui-icon name="loading" color="#5677fc" :size="40"></tui-icon>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 无数据提示 -->
    <view class="empty-box" v-else-if="postsList.length === 0 && !networkError">
      <tui-icon name="info" color="#cccccc" :size="80"></tui-icon>
      <text class="empty-text">暂无内容</text>
    </view>
    
    <!-- 文章列表 -->
    <view class="posts-list" v-else-if="!networkError">
      <view class="post-item" v-for="item in postsList" :key="item.id" @tap="goToPostDetail(item.id)">
        <view class="post-header">
          <view class="post-title">{{ item.title }}</view>
          <view class="post-meta">
            <text class="post-author">{{ item.authorName }}</text>
            <text class="post-time">{{ formatTime(item.publishTime) }}</text>
          </view>
        </view>
        <view class="post-content">{{ truncateContent(item.content) }}</view>
        <view class="post-footer">
          <view class="post-tags">
            <view class="tag" v-for="(tag, index) in item.tags" :key="index">{{ tag }}</view>
          </view>
          <view class="post-stats">
            <view class="stat-item">
              <tui-icon name="eye" color="#999" :size="24"></tui-icon>
              <text>{{ item.viewCount }}</text>
            </view>
            <view class="stat-item">
              <tui-icon name="message" color="#999" :size="24"></tui-icon>
              <text>{{ item.commentCount }}</text>
            </view>
          </view>
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
        <text>- 已加载全部内容 -</text>
      </view>
    </view>
    
    <!-- 悬浮发布按钮 -->
    <view class="float-btn" @tap="goToPublish">
      <tui-icon name="plus" color="#fff" :size="36"></tui-icon>
    </view>
  </view>
</template>

<script>
import { TuiIcon } from '@/utils/thorui.js'
import { getCommunityPosts, getMockPosts } from '@/api/community.js'
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
      networkError: false,
      postsList: [],
      originalPostsList: [], // 用于搜索和筛选
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      hasMoreData: false,
      searchText: '',
      activeTag: 'all'
    }
  },
  onLoad() {
    this.loadPostsList()
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 加载文章列表
    async loadPostsList() {
      try {
        this.loadingMore = this.currentPage > 1
        this.loading = !this.loadingMore
        this.networkError = false
        
        // 实际开发中取消注释下面的代码，获取真实数据
        // const res = await getCommunityPosts(this.currentPage, this.pageSize)
        
        // 使用模拟数据
        const res = getMockPosts()
        
        if (res.code === 200 && res.data) {
          // 获取缓存中的新发帖
          let cachedPosts = []
          try {
            cachedPosts = uni.getStorageSync('community_cached_posts') || []
          } catch (e) {
            console.error('获取缓存帖子失败', e)
          }
          
          // 如果是第一页，直接替换列表
          if (this.currentPage === 1) {
            // 将缓存的帖子和获取的帖子合并
            this.postsList = [...cachedPosts, ...(res.data.records || [])]
            this.originalPostsList = [...this.postsList]
          } else {
            // 如果是加载更多，只添加获取的帖子到列表末尾
            this.postsList = [...this.postsList, ...(res.data.records || [])]
            this.originalPostsList = [...this.originalPostsList, ...(res.data.records || [])]
          }
          
          this.totalCount = res.data.total || 0
          this.hasMoreData = this.postsList.length < this.totalCount
        } else {
          uni.showToast({
            title: res.message || '获取文章列表失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取文章列表错误', error)
        this.networkError = true
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },
    
    // 重试加载
    retryLoad() {
      this.currentPage = 1
      this.loadPostsList()
    },
    
    // 加载更多
    loadMore() {
      if (this.hasMoreData && !this.loadingMore) {
        this.currentPage++
        this.loadPostsList()
      }
    },
    
    // 处理搜索
    handleSearch() {
      if (!this.searchText.trim()) {
        this.filterByTag(this.activeTag) // 恢复标签筛选
        return
      }
      
      const keyword = this.searchText.trim().toLowerCase()
      
      // 先基于原始列表筛选标签
      let filteredByTag = this.originalPostsList
      if (this.activeTag !== 'all') {
        filteredByTag = this.originalPostsList.filter(post => 
          post.tags && post.tags.some(tag => tag.includes(this.activeTag))
        )
      }
      
      // 再基于标签筛选结果搜索关键词
      this.postsList = filteredByTag.filter(post => 
        post.title.toLowerCase().includes(keyword) || 
        post.content.toLowerCase().includes(keyword) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(keyword)))
      )
    },
    
    // 根据标签筛选
    filterByTag(tag) {
      this.activeTag = tag
      
      if (tag === 'all') {
        if (this.searchText.trim()) {
          // 如果有搜索词，重新搜索
          this.handleSearch()
        } else {
          // 没有搜索词，显示全部
          this.postsList = [...this.originalPostsList]
        }
        return
      }
      
      // 筛选包含该标签的文章
      this.postsList = this.originalPostsList.filter(post => 
        post.tags && post.tags.some(t => t.includes(tag))
      )
      
      // 如果有搜索词，再筛选一次
      if (this.searchText.trim()) {
        this.handleSearch()
      }
    },
    
    // 跳转到文章详情
    goToPostDetail(id) {
      uni.navigateTo({
        url: `/pages/community/detail?id=${id}`
      })
    },
    
    // 跳转到发布页面
    goToPublish() {
      // 检查用户是否已登录
      if (!checkLogin()) return
      
      uni.navigateTo({
        url: `/pages/community/publish`
      })
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
      return `${publishTime.getMonth() + 1}-${publishTime.getDate()}`
    },
    
    // 截断内容
    truncateContent(content) {
      if (!content) return ''
      return content.length > 80 ? content.substring(0, 80) + '...' : content
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

.title-box {
  margin-bottom: 20rpx;
}

.page-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.community-intro {
  padding: 20rpx 0;
  margin-bottom: 20rpx;
}

.community-intro text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 40rpx;
  padding: 14rpx 20rpx;
  margin-bottom: 20rpx;
}

.search-box input {
  flex: 1;
  margin-left: 20rpx;
  font-size: 28rpx;
}

.category-tags {
  display: flex;
  overflow-x: auto;
  padding: 10rpx 0;
  margin-bottom: 20rpx;
  white-space: nowrap;
}

.tag {
  display: inline-block;
  padding: 8rpx 20rpx;
  margin-right: 16rpx;
  font-size: 24rpx;
  color: #666;
  background-color: #f0f0f0;
  border-radius: 30rpx;
}

.tag.active {
  color: #fff;
  background-color: #5677fc;
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

.posts-list {
  margin-top: 20rpx;
}

.post-item {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.post-header {
  margin-bottom: 16rpx;
}

.post-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: #999;
}

.post-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16rpx;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
}

.post-tags .tag {
  margin-bottom: 10rpx;
  font-size: 22rpx;
  padding: 4rpx 16rpx;
}

.post-stats {
  display: flex;
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

.float-btn {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #5677fc;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 16rpx rgba(86, 119, 252, 0.3);
  z-index: 100;
}
</style> 