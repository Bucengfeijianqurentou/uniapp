<template>
  <view class="page-container">
    <!-- 顶部用户信息卡片 -->
    <view class="user-card">
      <view class="user-info">
        <view class="avatar-box">
          <tui-icon name="people-fill" color="#fff" :size="80"></tui-icon>
        </view>
        <view class="user-detail">
          <view class="user-name">{{userInfo.realName || '未登录'}}</view>
          <view class="user-role">家长监督员</view>
        </view>
      </view>
      <view class="user-account">
        <view class="account-item">
          <text class="account-label">账号：</text>
          <text class="account-value">{{userInfo.username || '--'}}</text>
        </view>
        <view class="account-item">
          <text class="account-label">区块链账户：</text>
          <text class="account-value">{{shortChainAccount}}</text>
          <tui-icon name="copy" color="#5677fc" :size="24" @tap="copyChainAccount"></tui-icon>
        </view>
      </view>
    </view>

    <!-- 用户功能列表 -->
    <view class="menu-list">
      <view class="menu-group">
        <view class="menu-title">账号信息</view>
        
        <view class="menu-item" @tap="navigateTo('/pages/user/profile')">
          <view class="item-left">
            <tui-icon name="my" color="#5677fc" :size="40"></tui-icon>
            <text class="item-text">个人资料</text>
          </view>
          <tui-icon name="arrowright" color="#999" :size="30"></tui-icon>
        </view>
        
        <view class="menu-item" @tap="navigateTo('/pages/user/security')">
          <view class="item-left">
            <tui-icon name="lock" color="#5677fc" :size="40"></tui-icon>
            <text class="item-text">账号安全</text>
          </view>
          <tui-icon name="arrowright" color="#999" :size="30"></tui-icon>
        </view>
      </view>
      
      <view class="menu-group">
        <view class="menu-title">应用设置</view>
        
        <view class="menu-item" @tap="navigateTo('/pages/settings/notification')">
          <view class="item-left">
            <tui-icon name="news" color="#5677fc" :size="40"></tui-icon>
            <text class="item-text">消息通知</text>
          </view>
          <tui-icon name="arrowright" color="#999" :size="30"></tui-icon>
        </view>
        
        <view class="menu-item" @tap="navigateTo('/pages/settings/about')">
          <view class="item-left">
            <tui-icon name="info" color="#5677fc" :size="40"></tui-icon>
            <text class="item-text">关于应用</text>
          </view>
          <tui-icon name="arrowright" color="#999" :size="30"></tui-icon>
        </view>
        
        <view class="menu-item" @tap="navigateTo('/pages/settings/feedback')">
          <view class="item-left">
            <tui-icon name="feedback" color="#5677fc" :size="40"></tui-icon>
            <text class="item-text">问题反馈</text>
          </view>
          <tui-icon name="arrowright" color="#999" :size="30"></tui-icon>
        </view>
      </view>
      
      <!-- 退出登录按钮 -->
      <view class="logout-btn" @tap="handleLogout">
        退出登录
      </view>
    </view>
    
    <!-- 自定义tabBar -->
    <tab-bar :current="3"></tab-bar>
  </view>
</template>

<script>
import { TuiIcon } from '@/utils/thorui.js'
import { getUserInfo, checkLogin, clearLoginInfo } from '@/utils/auth.js'
import TabBar from '@/components/tab-bar/tab-bar.vue'

export default {
  components: {
    TuiIcon,
    TabBar
  },
  data() {
    return {
      title: '个人中心',
      userInfo: {}
    }
  },
  computed: {
    shortChainAccount() {
      if (!this.userInfo.chainAccount) return '--';
      const account = this.userInfo.chainAccount;
      return account.substring(0, 8) + '...' + account.substring(account.length - 6);
    }
  },
  onShow() {
    // 检查登录状态
    if (!checkLogin()) {
      return;
    }
    
    // 获取最新的用户信息
    this.loadUserInfo();
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      const userInfo = getUserInfo();
      if (userInfo) {
        this.userInfo = userInfo;
      }
    },
    
    // 复制区块链账户
    copyChainAccount() {
      if (!this.userInfo.chainAccount) return;
      
      uni.setClipboardData({
        data: this.userInfo.chainAccount,
        success: () => {
          uni.showToast({
            title: '已复制到剪贴板',
            icon: 'none'
          });
        }
      });
    },
    
    // 导航到指定页面
    navigateTo(url) {
      uni.navigateTo({
        url: url,
        fail: (err) => {
          uni.showToast({
            title: '功能开发中',
            icon: 'none'
          });
        }
      });
    },
    
    // 退出登录
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除登录信息
            clearLoginInfo();
            
            // 跳转到登录页
            uni.reLaunch({
              url: '/pages/login/login'
            });
          }
        }
      });
    }
  }
}
</script>

<style>
.page-container {
  min-height: 100vh;
  background-color: #f8f8f8;
  box-sizing: border-box;
  padding-bottom: 120rpx; /* 为tabBar预留空间 */
}

.user-card {
  background-color: #5677fc;
  padding: 40rpx 30rpx;
  color: #fff;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.avatar-box {
  width: 120rpx;
  height: 120rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}

.user-detail {
  flex: 1;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.user-role {
  font-size: 26rpx;
  opacity: 0.8;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4rpx 16rpx;
  border-radius: 30rpx;
  display: inline-block;
}

.user-account {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  padding: 20rpx;
}

.account-item {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.account-item:last-child {
  margin-bottom: 0;
}

.account-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.account-value {
  font-size: 28rpx;
  flex: 1;
}

.menu-list {
  padding: 30rpx;
}

.menu-group {
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
}

.menu-title {
  font-size: 28rpx;
  color: #999;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
}

.item-text {
  font-size: 30rpx;
  color: #333;
  margin-left: 20rpx;
}

.logout-btn {
  text-align: center;
  background-color: #fff;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 12rpx;
  color: #fa3534;
  font-size: 32rpx;
  margin-top: 60rpx;
}
</style> 