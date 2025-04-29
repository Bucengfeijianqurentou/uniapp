<template>
  <view class="tab-bar">
    <view 
      class="tab-item" 
      v-for="(item, index) in tabList" 
      :key="index" 
      @tap="switchTab(index)"
      :class="{ active: current === index }"
    >
      <tui-icon 
        :name="current === index ? item.selectedIcon : item.icon" 
        :color="current === index ? selectedColor : color" 
        :size="48"
      ></tui-icon>
      <text 
        class="tab-text" 
        :class="{ 'tab-text-active': current === index }"
      >
        {{ item.text }}
      </text>
    </view>
  </view>
</template>

<script>
import { TuiIcon } from '@/utils/thorui.js'

export default {
  name: 'custom-tab-bar',
  components: {
    TuiIcon
  },
  props: {
    current: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      color: '#999999',
      selectedColor: '#5677fc',
      tabList: [
        {
          pagePath: '/pages/home/home',
          text: '首页',
          icon: 'home',
          selectedIcon: 'home-fill'
        },
        {
          pagePath: '/pages/process/process',
          text: '加工处理',
          icon: 'setup',
          selectedIcon: 'setup-fill'
        },
        {
          pagePath: '/pages/notice/notice',
          text: '通知公告',
          icon: 'news',
          selectedIcon: 'news-fill'
        },
        {
          pagePath: '/pages/user/user',
          text: '个人中心',
          icon: 'my',
          selectedIcon: 'my-fill'
        }
      ]
    }
  },
  methods: {
    switchTab(index) {
      if (this.current !== index) {
        uni.switchTab({
          url: this.tabList[index].pagePath,
          fail: (err) => {
            console.error('切换Tab失败:', err)
          }
        })
      }
    }
  }
}
</script>

<style>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #ffffff;
  display: flex;
  border-top: 1rpx solid #f5f5f5;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 9999;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 10rpx 0;
}

.tab-text {
  font-size: 22rpx;
  color: #999999;
  margin-top: 6rpx;
}

.tab-text-active {
  color: #5677fc;
}

.active {
  font-weight: bold;
}
</style> 