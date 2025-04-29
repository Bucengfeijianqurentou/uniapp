<template>
  <view class="login-container">
    <view class="login-content">
      <!-- 头部标题 -->
      <view class="header">
        <view class="title">中小学食堂监管平台</view>
        <view class="subtitle">家长监督端</view>
      </view>
      
      <!-- 登录表单 -->
      <view class="form-box">
        <view class="form-item">
          <tui-icon name="people" :size="36" color="#5677fc"></tui-icon>
          <input 
            class="input"
            type="text"
            v-model="loginForm.username"
            placeholder="请输入用户名"
            placeholder-class="placeholder"
          />
        </view>
        <view class="form-item">
          <tui-icon name="lock" :size="36" color="#5677fc"></tui-icon>
          <input 
            class="input"
            :type="passwordVisible ? 'text' : 'password'"
            v-model="loginForm.password"
            placeholder="请输入密码"
            placeholder-class="placeholder"
          />
          <view class="pwd-icon" @tap="togglePasswordVisibility">
            <tui-icon :name="passwordVisible ? 'eye' : 'eye-hide'" :size="36" color="#999"></tui-icon>
          </view>
        </view>
        <view class="form-tips">
          <text>* 首次登录默认密码为123456</text>
        </view>
        
        <!-- 登录按钮 -->
        <button class="login-btn" :loading="loading" @tap="handleLogin">登录</button>
        
        <!-- 其他操作 -->
        <view class="action-row">
          <view class="action-item" @tap="handleForgetPassword">忘记密码?</view>
          <view class="action-item" @tap="handleHelp">使用帮助</view>
        </view>
      </view>
      
      <!-- 底部信息 -->
      <view class="footer">
        <text>版本 1.0.0</text>
        <text>Copyright © 2025 食堂监管平台</text>
      </view>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
  padding: 40rpx;
  box-sizing: border-box;
}

.login-content {
  width: 100%;
  max-width: 600rpx;
  padding: 60rpx 40rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #5677fc;
  padding: 8rpx 24rpx;
  background-color: rgba(86, 119, 252, 0.1);
  border-radius: 40rpx;
  display: inline-block;
}

.form-box {
  margin-bottom: 60rpx;
}

.form-item {
  display: flex;
  align-items: center;
  height: 100rpx;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 30rpx;
  position: relative;
}

.input {
  flex: 1;
  height: 100%;
  padding-left: 20rpx;
  font-size: 32rpx;
}

.placeholder {
  color: #bbb;
  font-size: 32rpx;
}

.pwd-icon {
  padding: 10rpx;
}

.form-tips {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 50rpx;
}

.login-btn {
  height: 90rpx;
  line-height: 90rpx;
  width: 100%;
  background-color: #5677fc;
  color: #fff;
  font-size: 32rpx;
  border-radius: 45rpx;
  margin-bottom: 40rpx;
}

.action-row {
  display: flex;
  justify-content: space-between;
}

.action-item {
  font-size: 28rpx;
  color: #5677fc;
}

.footer {
  text-align: center;
  margin-top: 80rpx;
}

.footer text {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin: 10rpx 0;
}
</style> 