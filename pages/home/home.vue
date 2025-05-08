<template>
  <view class="page-container">
    <!-- 顶部状态栏占位 -->
    <view class="status-bar-holder"></view>
    
    <!-- 顶部固定区域 - 优化设计 -->
    <view class="fixed-header">
      <view class="header-wrapper">
        <view class="platform-title">
          <tui-icon name="food" color="#fff" :size="36"></tui-icon>
          <text>中小学食堂监管平台</text>
        </view>
      </view>
      <view class="search-container">
        <view class="search-box">
          <tui-icon name="search" color="#5677fc" :size="32"></tui-icon>
          <input type="text" placeholder="搜索菜品" v-model="searchText" @input="handleSearch" />
        </view>
      </view>
    </view>
    
    <!-- 为固定顶部预留空间 -->
    <view class="header-placeholder"></view>
    
    <view class="container">
      <!-- 轮播图区域 -->
      <view class="banner-box">
        <swiper class="banner-swiper" circular :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500"
          indicator-color="rgba(255,255,255,0.6)" indicator-active-color="#ff9500">
          <swiper-item v-for="(item, index) in banners" :key="index">
            <image :src="item.image" mode="aspectFill" class="banner-image" />
            <view class="banner-title">
              <text>{{item.title}}</text>
            </view>
          </swiper-item>
        </swiper>
      </view>

      <!-- 功能导航区域 -->
      <view class="nav-box">
        <view class="nav-item" v-for="(item, index) in navItems" :key="index" @tap="navigateTo(item.path)">
          <view class="nav-icon-wrapper" :class="`icon-gradient-${index+1}`">
            <tui-icon :name="item.icon" color="#ffffff" :size="40"></tui-icon>
          </view>
          <text class="nav-text">{{ item.name }}</text>
        </view>
      </view>

      <!-- 菜单列表区域 -->
      <view class="menu-box">
        <view class="section-header">
          <view class="title-with-icon">
            <tui-icon name="calendar" color="#ff9500" :size="32"></tui-icon>
            <text class="section-title">本周菜单</text>
          </view>
          <view class="more-link" @tap="showAllMenus">
            <text>查看全部</text>
            <tui-icon name="arrowright" color="#5677fc" :size="20"></tui-icon>
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
          <text class="empty-text">暂无菜单数据</text>
        </view>

        <!-- 菜单列表 -->
        <view class="menu-list" v-else>
          <view class="menu-item" v-for="item in menuList" :key="item.id" @tap="showMenuDetail(item)">
            <view class="menu-image-box">
              <image :src="getFullImageUrl(item.imagePath)" mode="aspectFill" class="menu-image" />
            </view>
            <view class="menu-content">
              <view class="menu-header">
                <text class="menu-title">{{ item.dishes }}</text>
                <text class="menu-type">{{ item.mealType }}</text>
              </view>
              <view class="menu-info">
                <view class="menu-date">
                  <tui-icon name="calendar" color="#999" :size="24"></tui-icon>
                  <text>{{ formatDate(item.menuDate) }}</text>
                </view>
                <view class="menu-provider">
                  <tui-icon name="people" color="#999" :size="24"></tui-icon>
                  <text>{{ item.userRealname }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 公告区域 -->
      <view class="notice-box">
        <view class="notice-header">
          <tui-icon name="news" color="#ff9500" :size="32"></tui-icon>
          <text class="notice-title">最新公告</text>
        </view>
        <view class="notice-content">
          <text class="notice-text">食品安全是学校工作的重中之重，请家长积极参与监督，共同守护孩子们的健康成长。</text>
          <view class="notice-actions">
            <tui-button type="primary" plain size="mini">查看详情</tui-button>
          </view>
        </view>
      </view>

      <!-- 底部信息 -->
      <view class="footer">
        <text>中小学食堂监管平台 · 家长版</text>
      </view>
    </view>

    <!-- 详情组件 -->
    <menu-detail :visible="showDetailModal" :menuItem="currentMenu" @close="closeDetail"></menu-detail>

    <!-- 自定义tabBar -->
    <tab-bar :current="0"></tab-bar>
  </view>
</template>

<script>
  import {
    TuiIcon,
    TuiButton
  } from '@/utils/thorui.js'
  import {
    getMenuList,
    getFullImageUrl
  } from '@/api/menu.js'
  import MenuDetail from '@/components/menu-detail/menu-detail.vue'
  import {
    checkLogin
  } from '@/utils/auth.js'
  import TabBar from '@/components/tab-bar/tab-bar.vue'

  export default {
    components: {
      TuiIcon,
      TuiButton,
      MenuDetail,
      TabBar
    },
    data() {
      return {
        title: '首页',
        loading: true,
        searchText: '',
        menuList: [],
        originMenuList: [], // 用于搜索过滤
        showDetailModal: false, // 是否显示详情弹窗
        currentMenu: null, // 当前查看的菜单
        banners: [{
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
        navItems: [{
            icon: 'star-fill',
            name: '评分榜单',
            path: '/pages/menu/rating-rank'
          },
          {
            icon: 'video',
            name: '实时监控',
            path: '/pages/monitor/index'
          },
          {
            icon: 'feedback',
            name: '反馈建议',
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
    onShow() {
      console.log('页面显示 onShow')
      // 检查登录状态
      if (!checkLogin()) {
        return
      }
    },
    onReady() {
      console.log('页面初次渲染完成 onReady')
    },
    created() {
      console.log('组件创建 created')
    },
    mounted() {
      console.log('组件挂载完成 mounted')

      // 添加一个强制检查的定时器，确保组件已挂载
      setTimeout(() => {
        console.log('定时器触发')
        // 打印可用的ThorUI图标
        console.log('使用的导航图标：', this.navItems.map(item => item.icon))
        console.log("开始获取菜单数据")

        // 尝试获取菜单数据
        this.fetchMenuList()
      }, 500)
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

      // 显示菜单详情
      showMenuDetail(item) {
        this.currentMenu = item
        this.showDetailModal = true
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
      },

      // 关闭详情弹窗
      closeDetail() {
        this.showDetailModal = false
        this.currentMenu = null
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

      // 缩短哈希字符串
      shortHash(hash) {
        if (!hash) return ''
        return hash.substring(0, 8) + '...' + hash.substring(hash.length - 6)
      },

      // 提交反馈
      submitFeedback() {
        uni.showToast({
          title: '反馈功能开发中',
          icon: 'none'
        })
      }
    }
  }
</script>

<style lang="scss">
  .page-container {
    min-height: 100vh;
    background-color: #f8f9fc;
    box-sizing: border-box;
    padding-bottom: 120rpx;
  }

  .status-bar-holder {
    height: var(--status-bar-height);
    width: 100%;
  }
  
  /* 固定顶部区域 - 优化后 */
  .fixed-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    height: calc(var(--status-bar-height) + 130rpx);
    background: linear-gradient(135deg, #4568DC, #B06AB3);
    padding-top: var(--status-bar-height);
    box-shadow: 0 8rpx 24rpx rgba(69, 104, 220, 0.25);
    
    .header-wrapper {
      padding: 15rpx 30rpx;
      
      .platform-title {
        display: flex;
        align-items: center;
        
        text {
          font-size: 34rpx;
          font-weight: bold;
          color: #fff;
          margin-left: 16rpx;
          text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
          letter-spacing: 1px;
        }
      }
    }
    
    .search-container {
      padding: 0 30rpx 15rpx;
      
      .search-box {
        display: flex;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.95);
        border-radius: 40rpx;
        padding: 10rpx 20rpx;
        box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.12);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        
        &:active {
          transform: scale(0.98);
          box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.08);
        }
        
        input {
          flex: 1;
          margin-left: 20rpx;
          font-size: 28rpx;
          color: #333;
          height: 50rpx;
        }
      }
    }
  }
  
  /* 为固定顶部预留的空间 */
  .header-placeholder {
    height: calc(var(--status-bar-height) + 70rpx);
    width: 100%;
  }

  .container {
    padding: 20rpx;
  }

  /* 轮播图样式优化 */
  .banner-box {
    width: 100%;
    height: 360rpx;
    margin-bottom: 30rpx;
    border-radius: 24rpx;
    overflow: hidden;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 100rpx;
      background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
      pointer-events: none;
      z-index: 2;
    }
  }

  .banner-swiper {
    width: 100%;
    height: 100%;
  }

  .banner-image {
    width: 100%;
    height: 100%;
  }
  
  .banner-title {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 30rpx;
    z-index: 3;
    
    text {
      color: #ffffff;
      font-size: 34rpx;
      font-weight: bold;
      text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.6);
      letter-spacing: 1px;
    }
  }

  /* 导航区域样式优化 */
  .nav-box {
    display: flex;
    justify-content: space-between;
    background-color: #ffffff;
    padding: 40rpx 30rpx;
    border-radius: 24rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 22%;
    
    .nav-icon-wrapper {
      width: 110rpx;
      height: 110rpx;
      border-radius: 28rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16rpx;
      box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.15);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      
      &:active {
        transform: translateY(6rpx) scale(0.95);
        box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
      }
    }
    
    .icon-gradient-1 {
      background: linear-gradient(135deg, #FF5E62, #FF9966);
    }
    
    .icon-gradient-2 {
      background: linear-gradient(135deg, #36D1DC, #5B86E5);
    }
    
    .icon-gradient-3 {
      background: linear-gradient(135deg, #11998e, #38ef7d);
    }
    
    .icon-gradient-4 {
      background: linear-gradient(135deg, #834d9b, #d04ed6);
    }
  }

  .nav-text {
    font-size: 28rpx;
    margin-top: 14rpx;
    color: #333;
    font-weight: 600;
  }

  /* 菜单区域样式 */
  .menu-box {
    background-color: #ffffff;
    padding: 30rpx;
    border-radius: 24rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .title-with-icon {
      display: flex;
      align-items: center;
      
      .section-title {
        font-size: 34rpx;
        font-weight: bold;
        color: #333;
        margin-left: 12rpx;
        letter-spacing: 1px;
      }
    }
    
    .more-link {
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: #5677fc;
      padding: 8rpx 16rpx;
      background-color: rgba(86, 119, 252, 0.1);
      border-radius: 30rpx;
      transition: background-color 0.3s ease;
      
      &:active {
        background-color: rgba(86, 119, 252, 0.2);
      }
      
      text {
        margin-right: 4rpx;
      }
    }
  }

  .loading-box,
  .empty-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300rpx;
    
    .loading-text,
    .empty-text {
      margin-top: 20rpx;
      font-size: 28rpx;
      color: #999;
    }
  }

  .menu-list {
    margin-top: 20rpx;
  }

  .menu-item {
    display: flex;
    margin-bottom: 30rpx;
    background-color: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);
    height: 200rpx;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: none;
    
    &:active {
      transform: translateY(4rpx) scale(0.99);
      box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  .menu-image-box {
    position: relative;
    width: 200rpx;
    height: 200rpx;
    flex-shrink: 0;
    
    .menu-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .menu-content {
    flex: 1;
    padding: 24rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
  }

  .menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    
    .menu-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      max-width: 65%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .menu-type {
      font-size: 22rpx;
      color: #5677fc;
      padding: 8rpx 16rpx;
      background-color: rgba(86, 119, 252, 0.1);
      border-radius: 30rpx;
      flex-shrink: 0;
      font-weight: 600;
    }
  }

  .menu-info {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    
    .menu-date, .menu-provider {
      display: flex;
      align-items: center;
      font-size: 24rpx;
      color: #666;
      
      text {
        margin-left: 10rpx;
      }
    }
  }

  /* 公告区域样式 */
  .notice-box {
    background-color: #ffffff;
    padding: 30rpx;
    border-radius: 24rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
    background-image: linear-gradient(to bottom right, rgba(255, 149, 0, 0.05), rgba(255, 149, 0, 0.1));
  }

  .notice-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .notice-title {
      font-size: 34rpx;
      font-weight: bold;
      margin-left: 12rpx;
      color: #333;
      letter-spacing: 1px;
    }
  }

  .notice-content {
    .notice-text {
      font-size: 28rpx;
      color: #666;
      line-height: 1.7;
      display: block;
      margin-bottom: 24rpx;
    }
    
    .notice-actions {
      display: flex;
      justify-content: flex-end;
    }
  }

  /* 底部样式 */
  .footer {
    text-align: center;
    padding: 40rpx 0;
    font-size: 24rpx;
    color: #999;
    letter-spacing: 1rpx;
  }
</style>