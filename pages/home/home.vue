<template>
  <view class="page-container">
    <view class="container">
      <!-- 头部区域 -->
      <view class="header">
        <view class="page-title">
          <text>中小学食堂监管平台</text>
        </view>
        <view class="search-box">
          <tui-icon name="search" color="#999" :size="32"></tui-icon>
          <input type="text" placeholder="搜索菜品" v-model="searchText" @input="handleSearch"/>
        </view>
      </view>
      
      <!-- 轮播图区域 -->
      <view class="banner-box">
        <swiper class="banner-swiper" circular :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500">
          <swiper-item v-for="(item, index) in banners" :key="index">
            <image :src="item.image" mode="aspectFill" class="banner-image" />
          </swiper-item>
        </swiper>
      </view>
      
      <!-- 功能导航区域 -->
      <view class="nav-box">
        <view class="nav-item" v-for="(item, index) in navItems" :key="index" @tap="navigateTo(item.path)">
          <tui-icon :name="item.icon" color="#5677fc" :size="60"></tui-icon>
          <text class="nav-text">{{ item.name }}</text>
        </view>
      </view>
      
      <!-- 菜单列表区域 -->
      <view class="menu-box">
        <view class="section-header">
          <text class="section-title">本周菜单</text>
          <text class="more-link" @tap="showAllMenus">查看全部</text>
        </view>
        
        <!-- 加载提示 -->
        <view class="loading-box" v-if="loading">
          <tui-icon name="loading" color="#5677fc" :size="40"></tui-icon>
          <text class="loading-text">加载中...</text>
        </view>
        
        <!-- 空数据提示 -->
        <view class="empty-box" v-else-if="menuList.length === 0">
          <tui-icon name="info" color="#999" :size="80"></tui-icon>
          <text class="empty-text">暂无菜单数据</text>
        </view>
        
        <!-- 菜单列表 -->
        <view class="menu-list" v-else>
          <view class="menu-item" v-for="item in menuList" :key="item.id" @tap="showMenuDetail(item)">
            <view class="menu-image-box">
              <image :src="getFullImageUrl(item.imagePath)" mode="aspectFill" class="menu-image" />
              <view class="menu-tag" :class="getStatusClass(item.status)">{{ getStatusText(item.status) }}</view>
            </view>
            <view class="menu-content">
              <view class="menu-header">
                <text class="menu-title">{{ item.dishes }}</text>
                <text class="menu-type">{{ item.mealType }}</text>
              </view>
              <view class="menu-date">{{ formatDate(item.menuDate) }}</view>
              <view class="menu-provider">
                <text>提供者: {{ item.userRealname }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 公告区域 -->
      <view class="notice-box">
        <view class="notice-header">
          <tui-icon name="news" color="#5677fc" :size="36"></tui-icon>
          <text class="notice-title">最新公告</text>
        </view>
        <view class="notice-content">
          <text>食品安全是学校工作的重中之重，请家长积极参与监督，共同守护孩子们的健康成长。</text>
        </view>
      </view>
      
      <!-- 底部信息 -->
      <view class="footer">
        <text>中小学食堂监管平台 · 家长版</text>
      </view>
    </view>
  </view>
</template>

<script>
import { TuiIcon } from '@/utils/thorui.js'
import { getMenuList, getFullImageUrl } from '@/api/menu.js'

export default {
  components: {
    TuiIcon
  },
  data() {
    return {
      title: '首页',
      loading: true,
      searchText: '',
      menuList: [],
      originMenuList: [], // 用于搜索过滤
      banners: [
        {
          image: '/static/images/1.jpg',
          title: '食品安全监管'
        },
        {
          image: '/static/images/2.jpg',
          title: '营养均衡饮食'
        },
        {
          image: '/static/images/3.jpg',
          title: '家校共育平台'
        }
      ],
      navItems: [
        {
          icon: 'calendar',
          name: '每周食谱',
          path: '/pages/menu/weekly'
        },
        {
          icon: 'shop',
          name: '食材信息',
          path: '/pages/food/info'
        },
        {
          icon: 'feedback',
          name: '评价反馈',
          path: '/pages/feedback/index'
        },
        {
          icon: 'community',
          name: '家长社区',
          path: '/pages/community/index'
        }
      ]
    }
  },
  onLoad() {
    console.log('首页加载完成')
    this.fetchMenuList()
    // 打印可用的ThorUI图标
    console.log('使用的导航图标：', this.navItems.map(item => item.icon))
  },
  methods: {
    // 获取菜单列表
    async fetchMenuList() {
      this.loading = true
      try {
        const res = await getMenuList()
        if (res.code === 200 && res.data) {
          // 按日期排序，最新的在前面
          this.menuList = res.data.records.sort((a, b) => {
            return new Date(b.menuDate) - new Date(a.menuDate)
          })
          this.originMenuList = [...this.menuList]
        } else {
          uni.showToast({
            title: res.message || '获取菜单失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取菜单错误', error)
        uni.showToast({
          title: '获取菜单失败，请稍后重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 处理搜索
    handleSearch() {
      if (!this.searchText) {
        this.menuList = [...this.originMenuList]
        return
      }
      
      this.menuList = this.originMenuList.filter(item => {
        return item.dishes.includes(this.searchText) || 
               item.mealType.includes(this.searchText) || 
               item.userRealname.includes(this.searchText)
      })
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
    
    // 显示菜单详情
    showMenuDetail(item) {
      uni.navigateTo({
        url: `/pages/menu/detail?id=${item.id}`
      })
    },
    
    // 显示所有菜单
    showAllMenus() {
      uni.navigateTo({
        url: '/pages/menu/list'
      })
    },
    
    // 导航到指定页面
    navigateTo(path) {
      uni.navigateTo({
        url: path
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
.header {
  display: flex;
  flex-direction: column;
  margin-bottom: 30rpx;
}
.page-title {
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
}
.search-box {
  display: flex;
  align-items: center;
  background-color: #f1f1f1;
  border-radius: 40rpx;
  padding: 14rpx 20rpx;
}
.search-box input {
  flex: 1;
  margin-left: 20rpx;
  font-size: 28rpx;
}

/* 轮播图样式 */
.banner-box {
  width: 100%;
  height: 300rpx;
  margin-bottom: 30rpx;
  border-radius: 12rpx;
  overflow: hidden;
}
.banner-swiper {
  width: 100%;
  height: 100%;
}
.banner-image {
  width: 100%;
  height: 100%;
}

/* 导航区域样式 */
.nav-box {
  display: flex;
  justify-content: space-between;
  background-color: #ffffff;
  padding: 30rpx;
  border-radius: 12rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 22%;
}
.nav-text {
  font-size: 24rpx;
  margin-top: 10rpx;
  color: #333;
}

/* 菜单区域样式 */
.menu-box {
  background-color: #ffffff;
  padding: 30rpx;
  border-radius: 12rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.more-link {
  font-size: 24rpx;
  color: #5677fc;
}
.loading-box, .empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300rpx;
}
.loading-text, .empty-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #999;
}
.menu-list {
  
}
.menu-item {
  display: flex;
  margin-bottom: 30rpx;
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}
.menu-image-box {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}
.menu-image {
  width: 100%;
  height: 100%;
}
.menu-tag {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  color: #fff;
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
.menu-content {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.menu-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  width: 60%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.menu-type {
  font-size: 22rpx;
  color: #5677fc;
  padding: 4rpx 10rpx;
  background-color: rgba(86, 119, 252, 0.1);
  border-radius: 6rpx;
}
.menu-date {
  font-size: 24rpx;
  color: #666;
  margin: 10rpx 0;
}
.menu-provider {
  font-size: 24rpx;
  color: #999;
}

/* 公告区域样式 */
.notice-box {
  background-color: #ffffff;
  padding: 30rpx;
  border-radius: 12rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}
.notice-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}
.notice-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-left: 10rpx;
  color: #333;
}
.notice-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
}

/* 底部样式 */
.footer {
  text-align: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #999;
}
</style> 