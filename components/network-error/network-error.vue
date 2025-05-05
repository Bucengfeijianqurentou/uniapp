<template>
  <view class="network-error-container" v-if="visible" @tap="handleRetry">
    <view class="error-content">
      <tui-icon name="wifi-off" color="#999" :size="80"></tui-icon>
      <text class="error-text">{{ errorMessage }}</text>
      <text class="retry-hint">点击屏幕重试</text>
    </view>
  </view>
</template>

<script>
import { TuiIcon } from '@/utils/thorui.js'

export default {
  name: 'network-error',
  components: {
    TuiIcon
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    errorMessage: {
      type: String,
      default: '连接服务器超时，点击屏幕重试'
    }
  },
  methods: {
    handleRetry() {
      this.$emit('retry')
    }
  }
}
</script>

<style>
.network-error-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
}

.error-text {
  font-size: 32rpx;
  color: #666;
  margin-top: 30rpx;
  text-align: center;
}

.retry-hint {
  font-size: 28rpx;
  color: #999;
  margin-top: 20rpx;
  text-align: center;
}
</style> 