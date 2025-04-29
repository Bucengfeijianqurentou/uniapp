<template>
  <view class="page-container">
    <view class="container">
      <view class="content">
        <view class="page-title">
          <text>加工处理</text>
        </view>
        <view class="page-content">
          <text class="tip-text">食品加工处理监管模块</text>
          <view class="info-card">
            <tui-icon name="explain" color="#5677fc" :size="80"></tui-icon>
            <text class="card-text">食品安全加工管理</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 自定义tabBar -->
    <tab-bar :current="1"></tab-bar>
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
      title: '加工处理'
    }
  },
  onLoad() {
    console.log('加工处理页面加载完成')
  },
  onShow() {
    // 检查登录状态
    if (!checkLogin()) {
      return
    }
  },
  methods: {
    
  }
}
</script>

<style>
.page-container {
  min-height: 100vh;
  box-sizing: border-box;
  padding-bottom: 120rpx; /* 为tabBar预留空间 */
}
.container {
  padding: 30rpx;
}
.page-title {
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 40rpx;
  color: #333;
}
.page-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 100rpx;
}
.tip-text {
  font-size: 30rpx;
  color: #666;
  margin-bottom: 40rpx;
}
.info-card {
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  width: 80%;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.card-text {
  margin-top: 30rpx;
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
}
</style> 