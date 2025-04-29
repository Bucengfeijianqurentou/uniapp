<template>
  <view class="login-container">
    <!-- 顶部装饰波浪 -->
    <view class="wave-box">
      <view class="wave wave1"></view>
      <view class="wave wave2"></view>
    </view>
    
    <!-- 徽标区域 -->
    <view class="logo-area">
      <view class="logo-icon">
        <tui-icon name="shield" color="#ffffff" :size="80"></tui-icon>
      </view>
      <view class="logo-title">中小学食堂监管平台</view>
      <view class="logo-subtitle">家长监督端</view>
    </view>
    
    <!-- 登录表单卡片 -->
    <view class="login-card">
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
            <tui-icon :name="passwordVisible ? 'eye' : 'eye-hide'" :size="40" color="#999"></tui-icon>
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
  background-color: #f8f8f8;
  overflow: hidden;
}

/* 顶部波浪装饰 */
.wave-box {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 400rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #4e62cc 0%, #5677fc 100%);
  z-index: 1;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 80rpx;
  background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNDQwIDMyMCI+PHBhdGggZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjciIGQ9Ik0wLDMyMEwxNDQwLDMyMEwxNDQwLDMyMEMxMTUyLDMyMCw4ODgsMzIwLDcyMCwzMjBDNTUyLDMyMCwyODgsMzIwLDAsMzIwWiI+PC9wYXRoPjwvc3ZnPg==') repeat-x;
  background-size: 1440px 80rpx;
}

.wave1 {
  opacity: 0.7;
  animation: wave 12s linear infinite;
}

.wave2 {
  opacity: 0.4;
  animation: wave 10s linear infinite reverse;
}

@keyframes wave {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-50%, 0, 0);
  }
}

/* 徽标区域 */
.logo-area {
  margin-top: 100rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  padding: 0 40rpx;
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
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
}

.logo-title {
  font-size: 44rpx;
  color: #ffffff;
  font-weight: bold;
  text-align: center;
  margin-bottom: 16rpx;
  text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.logo-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 30rpx;
  border-radius: 40rpx;
}

/* 登录卡片 */
.login-card {
  width: 650rpx;
  margin-top: 60rpx;
  background-color: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.08);
  padding: 50rpx 40rpx;
  z-index: 2;
}

/* 表单样式 */
.form-group {
  margin-bottom: 50rpx;
}

.input-group {
  display: flex;
  align-items: center;
  background-color: #f7f9fc;
  border-radius: 16rpx;
  padding: 20rpx 30rpx;
  margin-bottom: 30rpx;
  transition: all 0.3s;
}

.input-group:focus-within {
  box-shadow: 0 0 0 2rpx rgba(86, 119, 252, 0.2);
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
  background: linear-gradient(135deg, #5677fc 0%, #4e62cc 100%);
  border-radius: 45rpx;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 40rpx;
  box-shadow: 0 10rpx 20rpx rgba(86, 119, 252, 0.3);
  transition: transform 0.3s;
}

.btn-hover {
  transform: translateY(3rpx);
  box-shadow: 0 5rpx 10rpx rgba(86, 119, 252, 0.3);
}

/* 辅助功能区 */
.helper-area {
  display: flex;
  justify-content: space-between;
  padding: 0 20rpx;
}

.helper-link {
  color: #5677fc;
  font-size: 28rpx;
}

/* 安全提示 */
.security-tips {
  margin-top: 40rpx;
  display: flex;
  align-items: center;
  background-color: rgba(86, 119, 252, 0.05);
  padding: 20rpx 30rpx;
  border-radius: 12rpx;
  width: 650rpx;
}

.security-tips text {
  font-size: 24rpx;
  color: #999;
  margin-left: 15rpx;
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
  line-height: 1.5;
}
</style> 