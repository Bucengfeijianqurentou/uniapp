<template>
  <view>
    <!-- 使用主容器组件 -->
    <main-container></main-container>
  </view>
</template>

<script>
import MainContainer from '@/components/main-container/main-container.vue'

export default {
  components: {
    MainContainer
  },
  data() {
    return {}
  },
  onLoad() {
    console.log('主页面加载完成')
  }
}
</script>

<style>
</style>