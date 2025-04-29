<template>
  <view class="page-container">
    <!-- 头部标题栏 -->
    <view class="header">
      <view class="title-box">
        <text class="title">加工处理</text>
      </view>
      <view class="filter-box" @tap="showFilterOptions">
        <tui-icon name="filter" color="#fff" :size="32"></tui-icon>
        <text>筛选</text>
      </view>
    </view>
    
    <!-- 加工流程指示器 -->
    <view class="process-flow">
      <view class="flow-item" :class="{ active: activeFlow >= 1 }">
        <view class="flow-circle">1</view>
        <text>原料验收</text>
      </view>
      <view class="flow-line" :class="{ active: activeFlow >= 1 }"></view>
      <view class="flow-item" :class="{ active: activeFlow >= 2 }">
        <view class="flow-circle">2</view>
        <text>清洗消毒</text>
      </view>
      <view class="flow-line" :class="{ active: activeFlow >= 2 }"></view>
      <view class="flow-item" :class="{ active: activeFlow >= 3 }">
        <view class="flow-circle">3</view>
        <text>加工制作</text>
      </view>
      <view class="flow-line" :class="{ active: activeFlow >= 3 }"></view>
      <view class="flow-item" :class="{ active: activeFlow >= 4 }">
        <view class="flow-circle">4</view>
        <text>检验检测</text>
      </view>
    </view>
    
    <!-- 数据概览 -->
    <view class="overview-box">
      <view class="overview-item">
        <text class="overview-num">12</text>
        <text class="overview-label">今日加工</text>
      </view>
      <view class="overview-item">
        <text class="overview-num">3</text>
        <text class="overview-label">监管检查</text>
      </view>
      <view class="overview-item">
        <text class="overview-num">98%</text>
        <text class="overview-label">合格率</text>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <scroll-view scroll-y class="content-scroll" refresher-enabled @refresherrefresh="onRefresh" :refresher-triggered="refreshing">
      <!-- 标题栏 -->
      <view class="section-header">
        <text class="section-title">加工记录</text>
        <text class="more-link" @tap="viewAllRecords">查看全部</text>
      </view>
      
      <!-- 加工记录列表 -->
      <view class="record-list" v-if="processRecords.length > 0">
        <view 
          class="record-item" 
          v-for="(item, index) in processRecords" 
          :key="index"
          @tap="viewProcessDetail(item)"
        >
          <view class="status-tag" :class="getStatusClass(item.status)">
            {{ item.status }}
          </view>
          
          <view class="record-content">
            <view class="record-title">{{ item.title }}</view>
            <view class="record-info">
              <view class="info-item">
                <tui-icon name="calendar" color="#999" :size="24"></tui-icon>
                <text>{{ item.date }}</text>
              </view>
              <view class="info-item">
                <tui-icon name="clock" color="#999" :size="24"></tui-icon>
                <text>{{ item.time }}</text>
              </view>
            </view>
            <view class="record-desc">{{ item.desc }}</view>
            <view class="record-bottom">
              <view class="record-operator">
                <text>操作员：{{ item.operator }}</text>
              </view>
              <view class="record-action">
                <tui-icon name="arrowright" color="#5677fc" :size="24"></tui-icon>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 今日安全提示 -->
      <view class="safety-tips">
        <view class="tips-header">
          <tui-icon name="info-fill" color="#5677fc" :size="32"></tui-icon>
          <text>今日安全提示</text>
        </view>
        <view class="tips-content">
          <text>食品加工过程中，保持工作台清洁、工具消毒、生熟分开是保障食品安全的基本要求。请遵循加工流程操作规范，确保食品安全。</text>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="processRecords.length === 0">
        <tui-icon name="explain" color="#e0e0e0" :size="120"></tui-icon>
        <text>暂无加工记录</text>
        <text class="empty-sub">当前还没有食品加工记录，请稍后查看</text>
      </view>
    </scroll-view>
    
    <!-- 底部TabBar -->
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
      title: '加工处理',
      refreshing: false,
      activeFlow: 3, // 当前活跃的流程步骤
      processRecords: [
        {
          id: 1,
          title: '午餐主食-米饭加工',
          desc: '大米清洗、浸泡、蒸煮全流程记录，确保米饭清洁卫生、口感良好',
          date: '2025-04-26',
          time: '08:30-09:15',
          status: '已完成',
          operator: '李师傅',
          icon: 'food'
        },
        {
          id: 2,
          title: '午餐荤菜-红烧肉加工',
          desc: '猪肉清洗、切块、焯水、炖煮等工序，确保肉质鲜嫩、口感良好',
          date: '2025-04-26',
          time: '09:20-10:30',
          status: '进行中',
          operator: '张师傅',
          icon: 'food'
        },
        {
          id: 3,
          title: '午餐素菜-炒青菜加工',
          desc: '蔬菜清洗、切段、快速翻炒，保留营养成分，确保色香味俱佳',
          date: '2025-04-26',
          time: '10:00-10:20',
          status: '待处理',
          operator: '王师傅',
          icon: 'food'
        }
      ]
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
    // 获取状态样式类
    getStatusClass(status) {
      const classMap = {
        '已完成': 'status-completed',
        '进行中': 'status-processing',
        '待处理': 'status-pending'
      }
      return classMap[status] || 'status-default'
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
    
    // 查看全部记录
    viewAllRecords() {
      uni.showToast({
        title: '查看全部加工记录',
        icon: 'none'
      })
    },
    
    // 查看加工详情
    viewProcessDetail(item) {
      uni.showToast({
        title: `查看详情: ${item.title}`,
        icon: 'none'
      })
    },
    
    // 显示筛选选项
    showFilterOptions() {
      uni.showActionSheet({
        itemList: ['全部记录', '今日记录', '已完成', '进行中', '待处理'],
        success: (res) => {
          uni.showToast({
            title: `选择了: ${res.tapIndex}`,
            icon: 'none'
          })
        }
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
}

.filter-box {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 40rpx;
  padding: 10rpx 20rpx;
}

.filter-box text {
  margin-left: 10rpx;
  font-size: 28rpx;
}

/* 加工流程样式 */
.process-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 20rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
}

.flow-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100rpx;
}

.flow-circle {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  margin-bottom: 10rpx;
  font-weight: bold;
}

.flow-item.active .flow-circle {
  background-color: #5677fc;
}

.flow-item text {
  font-size: 24rpx;
  color: #666;
}

.flow-item.active text {
  color: #5677fc;
  font-weight: bold;
}

.flow-line {
  flex: 1;
  height: 4rpx;
  background-color: #e0e0e0;
}

.flow-line.active {
  background-color: #5677fc;
}

/* 数据概览样式 */
.overview-box {
  display: flex;
  background-color: #fff;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
}

.overview-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
  position: relative;
}

.overview-item:not(:last-child):after {
  content: '';
  position: absolute;
  right: 0;
  top: 20%;
  height: 60%;
  width: 1px;
  background-color: #eee;
}

.overview-num {
  font-size: 40rpx;
  color: #5677fc;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.overview-label {
  font-size: 24rpx;
  color: #999;
}

/* 内容区域样式 */
.content-scroll {
  flex: 1;
  box-sizing: border-box;
  padding: 0 20rpx;
}

/* 标题栏样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20rpx 0;
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

/* 加工记录列表样式 */
.record-list {
  margin-bottom: 20rpx;
}

.record-item {
  display: flex;
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.record-left {
  display: none;
}

.status-tag {
  display: inline-block;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  color: #fff;
  border-radius: 6rpx;
  margin-bottom: 20rpx;
}

.record-content {
  flex: 1;
}

.record-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
}

.record-info {
  display: flex;
  margin-bottom: 15rpx;
}

.info-item {
  display: flex;
  align-items: center;
  margin-right: 30rpx;
}

.info-item text {
  font-size: 24rpx;
  color: #999;
  margin-left: 6rpx;
}

.record-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

.record-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-operator {
  font-size: 24rpx;
  color: #999;
}

/* 安全提示样式 */
.safety-tips {
  display: none;
}

.tips-header {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.tips-header text {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-left: 10rpx;
}

.tips-content {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
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

.status-completed {
  background-color: #07c160;
}

.status-processing {
  background-color: #5677fc;
}

.status-pending {
  background-color: #ff9700;
}

.title-box {
  margin-bottom: 0;
}
</style> 