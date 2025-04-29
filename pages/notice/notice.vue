<template>
  <view class="page-container">
    <!-- 头部标题栏 -->
    <view class="header">
      <view class="title-box">
        <text class="title">通知公告</text>
      </view>
      <view class="search-box">
        <tui-icon name="search" color="#999" :size="32"></tui-icon>
        <input type="text" placeholder="搜索通知" v-model="searchText" />
      </view>
    </view>
    
    <!-- 分类选项卡 -->
    <view class="tabs">
      <view 
        class="tab-item" 
        v-for="(item, index) in tabList" 
        :key="index"
        :class="{ active: currentTab === index }"
        @tap="changeTab(index)"
      >
        <text>{{ item.name }}</text>
        <view class="tab-line" v-if="currentTab === index"></view>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <scroll-view scroll-y class="content-scroll" refresher-enabled @refresherrefresh="onRefresh" :refresher-triggered="refreshing">
      <!-- 通知列表 -->
      <view class="notice-list" v-if="filteredNotices.length > 0">
        <view 
          class="notice-item" 
          v-for="(item, index) in filteredNotices" 
          :key="index"
          @tap="viewNoticeDetail(item)"
        >
          <view class="notice-top">
            <view class="notice-tag" :class="getTagClass(item.type)">
              {{ item.type }}
            </view>
            <view class="notice-date">{{ item.date }}</view>
          </view>
          <view class="notice-title">{{ item.title }}</view>
          <view class="notice-desc">{{ item.desc }}</view>
          <view class="notice-bottom">
            <view class="notice-source">
              <tui-icon name="people-fill" color="#999" :size="24"></tui-icon>
              <text>{{ item.publisher }}</text>
            </view>
            <view class="notice-status" v-if="item.isNew">
              <view class="status-dot"></view>
              <text>未读</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <tui-icon name="news" color="#e0e0e0" :size="120"></tui-icon>
        <text>暂无通知</text>
        <text class="empty-sub">当前没有{{ tabList[currentTab].name }}，请稍后查看</text>
      </view>
    </scroll-view>
    
    <!-- 底部TabBar -->
    <tab-bar :current="2"></tab-bar>
  </view>
</template>

<script>
import { TuiIcon } from '@/utils/thorui.js'
import { checkLogin } from '@/utils/auth.js'
import TabBar from '@/components/tab-bar/tab-bar.vue'

export default {
  components: {
    TuiIcon,
    TabBar
  },
  data() {
    return {
      title: '通知公告',
      searchText: '',
      currentTab: 0,
      refreshing: false,
      tabList: [
        { name: '全部' },
        { name: '监管通知' },
        { name: '食品安全' },
        { name: '其他' }
      ],
      noticeList: [
        {
          id: 1,
          type: '监管通知',
          title: '关于加强学校食堂食品安全监管工作的通知',
          desc: '为进一步加强学校食堂食品安全监管工作，保障广大师生身体健康和生命安全，根据《食品安全法》等相关法律法规...',
          date: '2025-04-20',
          publisher: '市场监督管理局',
          isNew: true
        },
        {
          id: 2,
          type: '食品安全',
          title: '学校食品安全知识普及活动通知',
          desc: '为提高师生食品安全意识，普及食品安全知识，我校将于下周举办一系列食品安全知识普及活动，具体安排如下...',
          date: '2025-04-18',
          publisher: '食品安全委员会',
          isNew: false
        },
        {
          id: 3,
          type: '监管通知',
          title: '关于开展学校食堂春季食品安全检查的通知',
          desc: '为切实保障学校食品安全，预防食品安全事故的发生，根据上级部门工作安排，决定于近期开展学校食堂春季食品安全检查...',
          date: '2025-04-15',
          publisher: '教育局',
          isNew: true
        },
        {
          id: 4,
          type: '其他',
          title: '学校食堂饮食调查问卷',
          desc: '为了解学生对食堂饭菜的满意度，改进食堂工作，特开展此次问卷调查。请家长协助学生填写...',
          date: '2025-04-10',
          publisher: '学校后勤处',
          isNew: false
        }
      ]
    }
  },
  computed: {
    filteredNotices() {
      let result = this.noticeList
      
      // 根据标签筛选
      if (this.currentTab !== 0) {
        const tabName = this.tabList[this.currentTab].name
        result = result.filter(item => item.type === tabName)
      }
      
      // 根据搜索文本筛选
      if (this.searchText.trim()) {
        const keyword = this.searchText.toLowerCase()
        result = result.filter(item => 
          item.title.toLowerCase().includes(keyword) || 
          item.desc.toLowerCase().includes(keyword)
        )
      }
      
      return result
    }
  },
  onLoad() {
    console.log('通知公告页面加载完成')
  },
  onShow() {
    // 检查登录状态
    if (!checkLogin()) {
      return
    }
  },
  methods: {
    // 切换标签页
    changeTab(index) {
      this.currentTab = index
    },
    
    // 下拉刷新
    onRefresh() {
      this.refreshing = true
      
      // 模拟刷新过程
      setTimeout(() => {
        this.refreshing = false
        uni.showToast({
          title: '刷新成功',
          icon: 'none'
        })
      }, 1500)
    },
    
    // 获取通知标签的样式类
    getTagClass(type) {
      const classMap = {
        '监管通知': 'tag-primary',
        '食品安全': 'tag-success',
        '其他': 'tag-info'
      }
      return classMap[type] || 'tag-info'
    },
    
    // 查看通知详情
    viewNoticeDetail(item) {
      // 可以跳转到详情页或展开详情
      uni.showToast({
        title: `查看通知: ${item.title}`,
        icon: 'none'
      })
    }
  }
}
</script>

<style>
.page-container {
  min-height: 100vh;
  box-sizing: border-box;
  padding-bottom: 120rpx; /* 为tabBar预留空间 */
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
}

/* 头部标题栏样式 */
.header {
  background-color: #5677fc;
  padding: 30rpx;
  color: #fff;
}

.title-box {
  margin-bottom: 20rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 40rpx;
  padding: 12rpx 20rpx;
}

.search-box input {
  flex: 1;
  height: 60rpx;
  color: #fff;
  margin-left: 15rpx;
  font-size: 28rpx;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

/* 标签页样式 */
.tabs {
  display: flex;
  background-color: #fff;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 90rpx;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #5677fc;
  font-weight: bold;
}

.tab-line {
  position: absolute;
  bottom: 0;
  width: 60rpx;
  height: 6rpx;
  background-color: #5677fc;
  border-radius: 3rpx;
}

/* 内容区域样式 */
.content-scroll {
  flex: 1;
  box-sizing: border-box;
}

/* 通知列表样式 */
.notice-list {
  padding: 20rpx;
}

.notice-item {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.notice-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.notice-tag {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 6rpx;
  color: #fff;
}

.tag-primary {
  background-color: #5677fc;
}

.tag-success {
  background-color: #07c160;
}

.tag-info {
  background-color: #909399;
}

.notice-date {
  font-size: 24rpx;
  color: #999;
}

.notice-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
}

.notice-desc {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.notice-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24rpx;
  color: #999;
}

.notice-source {
  display: flex;
  align-items: center;
}

.notice-source text {
  margin-left: 10rpx;
}

.notice-status {
  display: flex;
  align-items: center;
}

.status-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #ff5a5f;
  margin-right: 10rpx;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 150rpx;
  color: #999;
}

.empty-state text {
  margin-top: 30rpx;
  font-size: 30rpx;
}

.empty-sub {
  font-size: 26rpx !important;
  color: #bbb;
  margin-top: 15rpx !important;
}
</style> 