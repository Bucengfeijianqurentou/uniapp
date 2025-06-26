<template>
  <view class="page-container">
    <view class="container">
      <!-- 导航栏 -->
      <view class="navbar">
        <view class="navbar-left" @tap="goBack">
          <tui-icon name="arrowleft" :size="36" color="#333"></tui-icon>
          <text class="navbar-title">质检详情</text>
        </view>
      </view>
      
      <!-- 加载提示 -->
      <view class="loading-box" v-if="loading">
        <tui-icon name="loading" color="#5677fc" :size="40"></tui-icon>
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 错误提示 -->
      <view class="error-box" v-else-if="loadError">
        <tui-icon name="warning" color="#ff7900" :size="80"></tui-icon>
        <text class="error-text">{{errorMsg}}</text>
        <view class="error-btn">
          <button type="primary" size="mini" @tap="loadInspectionDetail">重新加载</button>
        </view>
      </view>
      
      <!-- 质检详情内容 -->
      <view class="inspection-detail" v-else>
        <!-- 基本信息 -->
        <view class="detail-card">
          <view class="card-header">
            <view class="header-left">
              <view class="result-tag" :class="getResultClass(inspectionDetail.result)">
                {{getResultText(inspectionDetail.result)}}
              </view>
              <text class="inspection-time">{{formatDateTime(inspectionDetail.inspectionTime)}}</text>
            </view>
            <view class="header-right">
              <tui-icon name="scan" color="#5677fc" :size="40"></tui-icon>
            </view>
          </view>
          
          <!-- 质检图片 -->
          <view class="image-box" v-if="inspectionDetail.imagePath">
            <image :src="getFullImageUrl(inspectionDetail.imagePath)" mode="aspectFill" class="inspection-image" @tap="previewImage"></image>
          </view>
          
          <!-- 质检内容 -->
          <view class="info-section">
            <view class="section-title">
              <tui-icon name="check" color="#07c160" :size="32"></tui-icon>
              <text class="title-text">质检内容</text>
            </view>
            <view class="content-box">
              <text class="content-text">{{inspectionDetail.content}}</text>
            </view>
          </view>
          
          <!-- 问题描述 -->
          <view class="info-section" v-if="inspectionDetail.issues">
            <view class="section-title">
              <tui-icon name="warning" color="#ff7900" :size="32"></tui-icon>
              <text class="title-text">存在问题</text>
            </view>
            <view class="content-box">
              <text class="content-text">{{inspectionDetail.issues}}</text>
            </view>
          </view>
          
          <!-- 改进建议 -->
          <view class="info-section" v-if="inspectionDetail.suggestions">
            <view class="section-title">
              <tui-icon name="info" color="#5677fc" :size="32"></tui-icon>
              <text class="title-text">改进建议</text>
            </view>
            <view class="content-box">
              <text class="content-text">{{inspectionDetail.suggestions}}</text>
            </view>
          </view>
        </view>
        
        <!-- 区块链信息 -->
        <view class="blockchain-card" v-if="inspectionDetail.transactionHash">
          <view class="section-title">
            <tui-icon name="shield" color="#5677fc" :size="32"></tui-icon>
            <text class="title-text">溯源信息</text>
          </view>
          <view class="blockchain-item">
            <text class="label">区块链交易哈希：</text>
            <view class="hash-box" @tap="copyHash(inspectionDetail.transactionHash)">
              <text class="hash-value">{{shortHash(inspectionDetail.transactionHash)}}</text>
              <tui-icon name="copy" color="#5677fc" :size="26"></tui-icon>
            </view>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="action-box">
          <button type="primary" class="action-btn" @tap="shareInspection">
            <tui-icon name="share" color="#fff" :size="28"></tui-icon>
            分享质检报告
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { TuiIcon } from '@/utils/thorui.js'
import { getFullImageUrl } from '@/api/menu.js'
import config from '@/config/config.js'

export default {
  components: {
    TuiIcon
  },
  data() {
    return {
      menuId: '',
      loading: true,
      loadError: false,
      errorMsg: '加载失败，请重试',
      inspectionDetail: {
        id: '',
        inspectorId: '',
        inspectionTime: '',
        content: '',
        result: '',
        issues: '',
        suggestions: '',
        menuId: '',
        imagePath: '',
        transactionHash: ''
      }
    }
  },
  onLoad(options) {
    if (options.menuId) {
      this.menuId = options.menuId
      this.loadInspectionDetail()
    } else {
      this.loadError = true
      this.errorMsg = '缺少菜单ID参数'
      this.loading = false
    }
  },
  methods: {
    // 加载质检详情
    async loadInspectionDetail() {
      this.loading = true
      this.loadError = false
      
      try {
        const response = await uni.request({
          url: `${config.baseUrl}/api/inspections/${this.menuId}`, // 使用配置文件中的baseUrl
          method: 'GET'
        })
        
        if (response.statusCode === 200 && response.data) {
          this.inspectionDetail = response.data
        } else {
          this.loadError = true
          this.errorMsg = response.data?.message || '获取质检详情失败'
        }
      } catch (error) {
        console.error('获取质检详情错误', error)
        this.loadError = true
        this.errorMsg = '网络错误，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    
    // 获取完整图片URL
    getFullImageUrl(path) {
      return getFullImageUrl(path)
    },
    
    // 格式化日期时间
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return ''
      const date = new Date(dateTimeStr)
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    },
    
    // 获取结果文本
    getResultText(result) {
      const resultMap = {
        'PASS': '通过检验',
        'FAIL': '未通过',
        'PENDING': '待复查'
      }
      return resultMap[result] || '未知状态'
    },
    
    // 获取结果样式类
    getResultClass(result) {
      const classMap = {
        'PASS': 'result-pass',
        'FAIL': 'result-fail',
        'PENDING': 'result-pending'
      }
      return classMap[result] || ''
    },
    
    // 缩短哈希字符串
    shortHash(hash) {
      if (!hash) return ''
      return hash.substring(0, 10) + '...' + hash.substring(hash.length - 6)
    },
    
    // 复制哈希值
    copyHash(hash) {
      uni.setClipboardData({
        data: hash,
        success: () => {
          uni.showToast({
            title: '已复制到剪贴板',
            icon: 'none'
          })
        }
      })
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 分享质检报告
    shareInspection() {
      uni.showToast({
        title: '分享功能开发中',
        icon: 'none'
      })
    },
    
    // 预览图片
    previewImage() {
      if (!this.inspectionDetail.imagePath) return;
      
      const imageUrl = this.getFullImageUrl(this.inspectionDetail.imagePath);
      uni.previewImage({
        current: imageUrl,
        urls: [imageUrl],
        indicator: 'number',
        loop: false,
        longPressActions: {
          itemList: ['保存图片'],
          success: (data) => {
            if (data.tapIndex === 0) {
              // 保存图片
              uni.saveImageToPhotosAlbum({
                filePath: imageUrl,
                success: () => {
                  uni.showToast({
                    title: '保存成功',
                    icon: 'success'
                  });
                },
                fail: () => {
                  uni.showToast({
                    title: '保存失败',
                    icon: 'none'
                  });
                }
              });
            }
          }
        },
        fail: (err) => {
          console.error('图片预览失败', err);
          uni.showToast({
            title: '图片预览失败',
            icon: 'none'
          });
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
}

.container {
  padding: 30rpx;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.navbar-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-left: 10rpx;
  color: #333;
}

.loading-box, .error-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400rpx;
}

.loading-text, .error-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #999;
}

.error-btn {
  margin-top: 30rpx;
}

.detail-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.header-left {
  display: flex;
  align-items: center;
}

.result-tag {
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #fff;
  margin-right: 20rpx;
}

.result-pass {
  background-color: #07c160;
}

.result-fail {
  background-color: #fa3534;
}

.result-pending {
  background-color: #ff9700;
}

.inspection-time {
  font-size: 28rpx;
  color: #666;
}

.image-box {
  width: 100%;
  height: 400rpx;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.inspection-image {
  width: 100%;
  height: 100%;
}

.info-section {
  margin-bottom: 30rpx;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-left: 10rpx;
}

.content-box {
  background-color: #f8f8f8;
  padding: 20rpx;
  border-radius: 12rpx;
}

.content-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

.blockchain-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.blockchain-item {
  display: flex;
  flex-direction: column;
  margin-top: 20rpx;
}

.label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.hash-box {
  display: flex;
  align-items: center;
  background-color: #f8f8f8;
  padding: 16rpx;
  border-radius: 8rpx;
}

.hash-value {
  font-size: 28rpx;
  color: #5677fc;
  flex: 1;
  margin-right: 10rpx;
}

.action-box {
  margin-top: 40rpx;
  padding: 0 20rpx;
}

.action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
}
</style>