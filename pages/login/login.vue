<template>
  <view class="login-container">
    <!-- 背景层 -->
    <view class="bg-gradient">
      <image class="bg-pattern" src="/static/images/pattern.png" mode="repeat"></image>
    </view>
    
    <!-- 顶部装饰区域 -->
    <view class="header-area">
      <view class="logo">
        <view class="logo-icon">
          <tui-icon name="shield" color="#ffffff" :size="80"></tui-icon>
        </view>
        <view class="logo-text">
          <text class="logo-title">中小学食堂监管平台</text>
          <text class="logo-subtitle">家长监督端</text>
        </view>
      </view>
    </view>
    
    <!-- 登录表单卡片 -->
    <view class="login-card">
      <view class="card-title">账号登录</view>
      
      <!-- 表单项 -->
      <view class="form-group">
        <view class="input-group">
          <tui-icon name="people" :size="40" color="#5677fc"></tui-icon>
          <input 
            class="form-input"
            type="text"
            v-model="loginForm.username"
            placeholder="请输入用户名"
            placeholder-class="placeholder"
          />
        </view>
        
        <view class="input-group">
          <tui-icon name="lock" :size="40" color="#5677fc"></tui-icon>
          <input 
            class="form-input"
            :type="passwordVisible ? 'text' : 'password'"
            v-model="loginForm.password"
            placeholder="请输入密码"
            placeholder-class="placeholder"
          />
          <view class="eye-icon" @tap="togglePasswordVisibility">
            <tui-icon :name="passwordVisible ? 'eye' : 'eye-hide'" :size="36" color="#999"></tui-icon>
          </view>
        </view>
        
        <view class="tips">
          <text>* 首次登录默认密码为123456</text>
        </view>
      </view>
      
      <!-- 登录按钮 -->
      <button class="login-btn" :loading="loading" @tap="handleLogin" hover-class="btn-hover">登录</button>
      
      <!-- 辅助功能区 -->
      <view class="helper-area">
        <view class="helper-link" @tap="handleForgetPassword">忘记密码?</view>
        <view class="helper-link" @tap="handleHelp">使用帮助</view>
      </view>
    </view>
    
    <!-- 安全提示 -->
    <view class="security-tips">
      <tui-icon name="info" :size="30" color="#999"></tui-icon>
      <text>请妥善保管您的账号信息，定期更换密码</text>
    </view>
    
    <!-- 底部版权信息 -->
    <view class="copyright">
      <text>版本 1.0.0</text>
      <text>Copyright © 2025 食堂监管平台</text>
    </view>
  </view>
</template>

<script>
import { TuiIcon } from '@/utils/thorui.js'
import { login } from '@/api/user.js'
import { saveToken, saveUserInfo } from '@/utils/auth.js'

export default {
  components: {
    TuiIcon
  },
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        role: 'STUDENT_PARENT' // 默认角色
      },
      passwordVisible: false,
      loading: false
    }
  },
  onLoad() {
    // 检查是否已登录
    const token = uni.getStorageSync('token')
    if (token) {
      this.redirectToHome()
    }
  },
  methods: {
    // 切换密码可见性
    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible
    },
    
    // 处理登录
    async handleLogin() {
      // 表单验证
      if (!this.loginForm.username.trim()) {
        uni.showToast({
          title: '请输入用户名',
          icon: 'none'
        })
        return
      }
      
      if (!this.loginForm.password) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        })
        return
      }
      
      this.loading = true
      
      try {
        const result = await login(this.loginForm)
        
        if (result.code === 200) {
          // 登录成功
          const userData = result.data
          
          // 存储用户信息和token
          saveToken(userData.token)
          saveUserInfo(userData.user)
          
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })
          
          // 跳转到首页
          setTimeout(() => {
            this.redirectToHome()
          }, 1500)
        } else {
          // 登录失败
          uni.showToast({
            title: result.message || '登录失败，请检查用户名和密码',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('登录请求失败', error)
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 跳转到首页
    redirectToHome() {
      // 使用reLaunch确保正确跳转到tabBar页面
      uni.reLaunch({
        url: '/pages/home/home',
        fail: (err) => {
          console.error('跳转失败:', err)
          // 尝试使用switchTab
          uni.switchTab({
            url: '/pages/home/home',
            fail: (switchErr) => {
              console.error('switchTab失败:', switchErr)
              // 作为最后手段，使用navigateTo
              uni.navigateTo({
                url: '/pages/home/home'
              })
            }
          })
        }
      })
    },
    
    // 忘记密码
    handleForgetPassword() {
      uni.showToast({
        title: '请联系学校管理员重置密码',
        icon: 'none'
      })
    },
    
    // 使用帮助
    handleHelp() {
      uni.showToast({
        title: '帮助功能正在开发中',
        icon: 'none'
      })
    }
  }
}
</script>

<style>
.login-container {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f9fafc;
  overflow: hidden;
}

/* 背景渐变和图案 */
.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 450rpx;
  background: linear-gradient(135deg, #4568DC, #B06AB3);
  z-index: 1;
  overflow: hidden;
}

.bg-pattern {
  width: 100%;
  height: 100%;
  opacity: 0.1;
}

/* 顶部徽标区域 */
.header-area {
  width: 100%;
  padding-top: 100rpx;
  padding-bottom: 80rpx;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-icon {
  width: 160rpx;
  height: 160rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(5px);
}

.logo-text {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-title {
  font-size: 44rpx;
  color: #ffffff;
  font-weight: bold;
  text-align: center;
  margin-bottom: 16rpx;
  text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.2);
  letter-spacing: 2rpx;
}

.logo-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 40rpx;
  border-radius: 40rpx;
  backdrop-filter: blur(5px);
}

/* 登录卡片 */
.login-card {
  width: 650rpx;
  background-color: #ffffff;
  border-radius: 30rpx;
  box-shadow: 0 15rpx 40rpx rgba(0, 0, 0, 0.1);
  padding: 50rpx 40rpx;
  z-index: 2;
  position: relative;
}

.card-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 40rpx;
  text-align: center;
  position: relative;
}

.card-title:after {
  content: '';
  position: absolute;
  bottom: -10rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 80rpx;
  height: 6rpx;
  background: linear-gradient(to right, #4568DC, #B06AB3);
  border-radius: 3rpx;
}

/* 表单样式 */
.form-group {
  margin-bottom: 50rpx;
}

.input-group {
  display: flex;
  align-items: center;
  background-color: #f7f9fc;
  border: 2rpx solid #eef2f9;
  border-radius: 20rpx;
  padding: 20rpx 30rpx;
  margin-bottom: 30rpx;
  transition: all 0.3s ease;
}

.input-group:focus-within {
  box-shadow: 0 0 0 3rpx rgba(69, 104, 220, 0.1);
  border-color: #4568DC;
  background-color: #ffffff;
}

.form-input {
  flex: 1;
  height: 80rpx;
  font-size: 32rpx;
  margin-left: 20rpx;
  color: #333;
}

.placeholder {
  color: #bbb;
}

.eye-icon {
  padding: 10rpx;
}

.tips {
  font-size: 24rpx;
  color: #999;
  padding: 0 10rpx;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  background: linear-gradient(135deg, #4568DC, #B06AB3);
  border-radius: 45rpx;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 40rpx;
  box-shadow: 0 10rpx 20rpx rgba(69, 104, 220, 0.25);
  transition: all 0.3s ease;
  border: none;
}

.btn-hover {
  transform: translateY(3rpx) scale(0.98);
  box-shadow: 0 5rpx 10rpx rgba(69, 104, 220, 0.2);
  opacity: 0.9;
}

/* 辅助功能区 */
.helper-area {
  display: flex;
  justify-content: space-between;
  padding: 0 20rpx;
}

.helper-link {
  color: #4568DC;
  font-size: 28rpx;
  transition: opacity 0.3s ease;
}

.helper-link:active {
  opacity: 0.7;
}

/* 安全提示 */
.security-tips {
  margin-top: 40rpx;
  display: flex;
  align-items: center;
  background-color: rgba(69, 104, 220, 0.05);
  padding: 20rpx 30rpx;
  border-radius: 20rpx;
  width: 650rpx;
}

.security-tips text {
  font-size: 24rpx;
  color: #888;
  margin-left: 15rpx;
  line-height: 1.4;
}

/* 底部版权信息 */
.copyright {
  margin-top: 60rpx;
  padding: 40rpx 0;
  text-align: center;
}

.copyright text {
  display: block;
  font-size: 24rpx;
  color: #999;
  line-height: 1.6;
}
</style> 