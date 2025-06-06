<template>
	<view class="content">
		<!-- 页面顶部标题栏 -->
		<view class="header">
			<view class="header-title">
				<text class="title-text">食堂实时监控</text>
			</view>
			<view class="camera-info">
				<tui-icon name="circle" color="#1afa29" :size="16"></tui-icon>
				<text class="camera-text">实时画面</text>
			</view>
		</view>
		
		<!-- 视频监控主体部分 -->
		<view class="video-container">
			<view class="video-wrapper" ref="videoWrapper">
				<!-- 视频占位 -->
				<view v-show="showPlaceholder" class="placeholder">
					<tui-icon name="video-fill" color="#fff" :size="50"></tui-icon>
					<text class="placeholder-text">正在连接监控画面...</text>
				</view>
				<!-- 视频元素将直接添加在这里 -->
				<view id="video-container"></view>
			</view>
			
			<!-- 连接状态显示 -->
			<view class="connection-status" v-if="connectionStatus">
				<text :class="['status-text', statusClass]">{{connectionStatus}}</text>
			</view>
			
			<!-- 监控操作栏 -->
			<view class="video-controls">
				<tui-button type="primary" shape="circle" width="220rpx" height="70rpx" @click="startVideo">
					<tui-icon name="play" color="#fff" :size="20"></tui-icon>
					<text class="btn-text">开始播放</text>
				</tui-button>
				<tui-button type="danger" shape="circle" width="220rpx" height="70rpx" @click="stopVideo">
					<tui-icon name="stop" color="#fff" :size="20"></tui-icon>
					<text class="btn-text">停止播放</text>
				</tui-button>
			</view>
			
			<!-- 监控说明区域 -->
			<view class="monitor-info">
				<view class="info-header">
					<tui-icon name="shield" color="#5677fc" :size="20"></tui-icon>
					<text class="info-title">食堂透明监督说明</text>
				</view>
				<view class="info-content">
					<view class="info-item">
						<tui-icon name="check" color="#5677fc" :size="18"></tui-icon>
						<text class="info-text">视频采集自学校食堂加工区，实时显示食品制作过程</text>
					</view>
					<view class="info-item">
						<tui-icon name="check" color="#5677fc" :size="18"></tui-icon>
						<text class="info-text">画面实时监控，确保您了解最新食堂作业状态</text>
					</view>
					<view class="info-item">
						<tui-icon name="check" color="#5677fc" :size="18"></tui-icon>
						<text class="info-text">为保护工作人员隐私，部分区域可能会进行模糊处理</text>
					</view>
					<view class="info-item">
						<tui-icon name="check" color="#5677fc" :size="18"></tui-icon>
						<text class="info-text">如发现食品安全问题，请使用"反馈建议"功能报告</text>
					</view>
				</view>
			</view>
			
			<!-- 当前监控信息 -->
			<view class="camera-details">
				<view class="detail-item">
					<text class="detail-label">监控位置：</text>
					<text class="detail-value">主厨房加工区</text>
				</view>
				<view class="detail-item">
					<text class="detail-label">更新时间：</text>
					<text class="detail-value">{{ getCurrentTime() }}</text>
				</view>
				<view class="detail-item">
					<text class="detail-label">在线状态：</text>
					<text class="detail-value status-online">在线</text>
				</view>
			</view>
		</view>
		
		<!-- 调试区域，正式环境可隐藏 -->
		<view class="debug-toggle" @click="toggleDebug">
			<text class="debug-text">{{ showDebug ? '隐藏调试信息' : '显示调试信息' }}</text>
		</view>
		<view class="debug-info" v-if="showDebug">
			<view class="debug-item">
				<text class="debug-label">RTSP地址：</text>
				<text class="debug-value">{{rtspUrl}}</text>
			</view>
			<view class="debug-item">
				<text class="debug-label">WebRTC服务：</text>
				<text class="debug-value">{{serverUrl}}</text>
			</view>
			<view class="debug-item">
				<text class="debug-label">初始化状态：</text>
				<text class="debug-value">{{webRtcServer ? '已初始化' : '未初始化'}}</text>
			</view>
			<view class="debug-actions">
				<tui-button type="gray" width="280rpx" height="60rpx" @click="testServerConnection">测试服务连接</tui-button>
			</view>
		</view>
		
		<!-- 自定义tabBar -->
		<tab-bar :current="-1"></tab-bar>
	</view>
</template>

<script>
	import { TuiIcon, TuiButton } from '@/utils/thorui.js'
	import TabBar from '@/components/tab-bar/tab-bar.vue'
	import config from '@/config/config.js'
	
	export default {
		components: {
			TuiIcon,
			TuiButton,
			TabBar
		},
		data() {
			return {
				webRtcServer: null,
				rtspUrl: config.monitor.rtspUrl,
				serverUrl: config.monitor.webRtcServerUrl,
				connectionStatus: '等待连接视频流',
				statusClass: 'status-pending',
				showDebug: false,
				videoElement: null,
				showPlaceholder: true,
				isLoading: false
			}
		},
		mounted() {
			// 初始化视频处理
			setTimeout(() => {
				this.loadScript('/static/adapter-latest.js', () => {
					this.loadScript('/static/webrtcstreamer.js', () => {
						this.initWebRTC();
						// 初始化完成后自动播放
						setTimeout(() => {
							this.startVideo();
						}, 1000);
					});
				});
			}, 500);
		},
		beforeDestroy() {
			console.log('页面销毁，清理资源');
			this.cleanupResources();
		},
		onHide() {
			console.log('页面隐藏，清理资源');
			this.cleanupResources();
		},
		onUnload() {
			console.log('页面卸载，清理资源');
			this.cleanupResources();
		},
		onShow() {
			console.log('页面显示，检查是否需要播放视频');
			// 如果已经初始化但未播放，则自动开始播放
			if (this.webRtcServer && this.showPlaceholder) {
				console.log('自动开始播放视频');
				setTimeout(() => {
					this.startVideo();
				}, 500);
			}
		},
		methods: {
			// 清理所有资源
			cleanupResources() {
				try {
					// 停止视频流
					this.stopVideo();
					
					// 移除视频元素
					this.removeVideoElement();
					
					// 清理WebRTC实例
					if (this.webRtcServer) {
						try {
							this.webRtcServer.disconnect();
							this.webRtcServer = null;
						} catch (e) {
							console.error('清理WebRTC实例失败:', e);
						}
					}
					
					// 移除可能加载的脚本
					this.removeScripts();
				} catch (e) {
					console.error('清理资源失败:', e);
				}
			},
			
			// 移除加载的脚本
			removeScripts() {
				try {
					const scripts = document.querySelectorAll('script[src*="webrtcstreamer.js"], script[src*="adapter-latest.js"]');
					scripts.forEach(script => {
						script.parentNode && script.parentNode.removeChild(script);
					});
				} catch (e) {
					console.error('移除脚本失败:', e);
				}
			},
			
			// 获取当前时间
			getCurrentTime() {
				const now = new Date();
				const hours = String(now.getHours()).padStart(2, '0');
				const minutes = String(now.getMinutes()).padStart(2, '0');
				const seconds = String(now.getSeconds()).padStart(2, '0');
				return `${hours}:${minutes}:${seconds}`;
			},
			
			// 加载JS脚本
			loadScript(url, callback) {
				try {
					const script = document.createElement('script');
					script.type = 'text/javascript';
					script.src = url;
					script.onload = callback;
					document.head.appendChild(script);
				} catch(e) {
					console.error('加载脚本失败:', e);
					this.connectionStatus = '加载脚本失败: ' + e.message;
					this.statusClass = 'status-error';
				}
			},
			
			// 初始化WebRTC
			initWebRTC() {
				try {
					this.connectionStatus = '正在初始化系统...';
					this.statusClass = 'status-pending';
					
					// 创建video元素
					this.createVideoElement();
					
					if (this.videoElement) {
						// 创建WebRTC实例
						this.webRtcServer = new WebRtcStreamer(this.videoElement, this.serverUrl);
						
						this.connectionStatus = '系统就绪，正在连接视频流...';
						this.statusClass = 'status-ready';
						console.log('WebRTC初始化成功');
						
						// 添加播放状态监听
						this.videoElement.onplaying = () => {
							this.connectionStatus = '视频播放中';
							this.statusClass = 'status-success';
							this.showPlaceholder = false;
						};
						
						this.videoElement.onerror = (e) => {
							this.connectionStatus = '视频播放出错: ' + e;
							this.statusClass = 'status-error';
							console.error('视频播放错误:', e);
						};
					} else {
						this.connectionStatus = '无法创建视频元素';
						this.statusClass = 'status-error';
					}
				} catch(e) {
					this.connectionStatus = '初始化失败: ' + e.message;
					this.statusClass = 'status-error';
					console.error('WebRTC初始化失败:', e);
				}
			},
			
			// 创建视频元素
			createVideoElement() {
				try {
					// 先移除可能存在的旧元素
					this.removeVideoElement();
					
					// 获取视频容器元素
					const videoContainer = document.getElementById('video-container');
					if (!videoContainer) {
						console.error('无法找到视频容器元素');
						return;
					}
					
					// 创建新的video元素
					this.videoElement = document.createElement('video');
					this.videoElement.id = 'webrtc-video';
					this.videoElement.className = 'video-player';
					this.videoElement.autoplay = true;
					this.videoElement.muted = true;
					this.videoElement.playsInline = true; // 兼容iOS
					this.videoElement.controls = false;
					
					// 设置视频样式
					Object.assign(this.videoElement.style, {
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						borderRadius: '20rpx',
						position: 'absolute',
						top: 0,
						left: 0
					});
					
					// 将视频元素添加到容器中
					videoContainer.appendChild(this.videoElement);
					
					console.log('视频元素创建成功');
				} catch(e) {
					console.error('创建视频元素失败:', e);
					this.connectionStatus = '创建视频元素失败: ' + e.message;
					this.statusClass = 'status-error';
				}
			},
			
			// 定位视频元素 - 这个方法不再需要在滚动时调整位置
			positionVideoElement() {
				// 不需要特殊定位，视频元素会随着容器一起滚动
				console.log('视频元素定位在容器内');
			},
			
			// 移除视频元素
			removeVideoElement() {
				try {
					// 查找并移除所有可能的视频元素
					const videoElements = document.querySelectorAll('#webrtc-video, .video-player');
					videoElements.forEach(element => {
						if (element && element.parentNode) {
							element.parentNode.removeChild(element);
						}
					});
					
					// 清空引用
					this.videoElement = null;
					
					// 恢复占位符显示
					this.showPlaceholder = true;
					
					console.log('视频元素已移除');
				} catch(e) {
					console.error('移除视频元素失败:', e);
				}
			},
			
			// 开始播放视频
			startVideo() {
				try {
					this.isLoading = true;
					if (!this.webRtcServer || !this.videoElement) {
						this.connectionStatus = '系统尚未初始化，正在重新初始化...';
						this.statusClass = 'status-pending';
						this.initWebRTC();
						
						// 延迟连接
						setTimeout(() => {
							if (this.webRtcServer && this.videoElement) {
								this.connectToStream();
							}
							this.isLoading = false;
						}, 1000);
						return;
					}
					
					this.connectToStream();
					this.isLoading = false;
				} catch(e) {
					this.connectionStatus = '连接失败: ' + e.message;
					this.statusClass = 'status-error';
					console.error('连接失败:', e);
					this.isLoading = false;
				}
			},
			
			// 连接到视频流
			connectToStream() {
				this.connectionStatus = '正在连接监控画面...';
				this.statusClass = 'status-pending';
				this.showPlaceholder = true;
				
				// 确保旧连接已断开
				if (this.webRtcServer) {
					try {
						this.webRtcServer.disconnect();
					} catch(e) {
						console.warn('断开旧连接时出错:', e);
					}
				}
				
				// 连接到新流
				setTimeout(() => {
					if (this.webRtcServer && this.videoElement) {
						this.webRtcServer.connect(this.rtspUrl);
					}
				}, 300);
				
				uni.showToast({
					title: '正在连接视频流...',
					icon: 'none'
				});
			},
			
			// 停止播放视频
			stopVideo() {
				try {
					if(this.webRtcServer) {
						this.webRtcServer.disconnect();
						this.connectionStatus = '已停止播放';
						this.statusClass = 'status-warning';
						this.showPlaceholder = true;
						
						uni.showToast({
							title: '已停止播放',
							icon: 'none'
						});
					}
				} catch(e) {
					this.connectionStatus = '断开连接失败: ' + e.message;
					this.statusClass = 'status-error';
					console.error('断开连接失败:', e);
				}
			},
			
			// 显示/隐藏调试信息
			toggleDebug() {
				this.showDebug = !this.showDebug;
			},
			
			// 测试WebRTC服务器连接
			testServerConnection() {
				this.connectionStatus = '正在测试服务器连接...';
				this.statusClass = 'status-pending';
				
				// 使用fetch测试连接
				fetch(this.serverUrl + '/api/getIceServers')
					.then(response => {
						if (response.ok) {
							return response.json();
						} else {
							throw new Error('服务器响应错误：' + response.status);
						}
					})
					.then(data => {
						console.log('ICE服务器信息:', data);
						this.connectionStatus = '服务器连接成功';
						this.statusClass = 'status-success';
						
						uni.showToast({
							title: '服务器连接成功',
							icon: 'success'
						});
					})
					.catch(error => {
						console.error('服务器连接测试失败:', error);
						this.connectionStatus = '服务器连接失败: ' + error.message;
						this.statusClass = 'status-error';
						
						uni.showToast({
							title: '服务器连接失败',
							icon: 'error'
						});
					});
			}
		}
	}
</script>

<style lang="scss">
.content {
	width: 100%;
	min-height: 100vh;
	padding-bottom: 120rpx;
	box-sizing: border-box;
	background-color: #f8f9fc;
}

.header {
	background: linear-gradient(135deg, #4568DC, #B06AB3);
	padding: 40rpx 30rpx;
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	color: #fff;
	margin-bottom: 30rpx;
	box-shadow: 0 8rpx 24rpx rgba(69, 104, 220, 0.25);
}

.header-title {
	display: flex;
	align-items: center;
	font-size: 36rpx;
	font-weight: bold;
	justify-content: center;
	
	.title-text {
		letter-spacing: 1px;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
	}
}

.camera-info {
	display: flex;
	align-items: center;
	font-size: 24rpx;
	
	.camera-text {
		margin-left: 10rpx;
		opacity: 0.9;
	}
}

.video-container {
	padding: 0 30rpx;
}

.video-wrapper {
	width: 100%;
	height: 400rpx;
	background-color: #000;
	border-radius: 20rpx;
	overflow: hidden;
	position: relative;
	margin-bottom: 30rpx;
	box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.3);
}

#video-container {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 3;
}

.placeholder {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: rgba(0,0,0,0.7);
	z-index: 5;
	gap: 20rpx;
}

.placeholder-text {
	color: #fff;
	font-size: 28rpx;
	margin-top: 16rpx;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.5);
}

.video-player {
	width: 100%;
	height: 100%;
	display: block;
	object-fit: cover;
}

.connection-status {
	background-color: rgba(86, 119, 252, 0.1);
	padding: 14rpx 20rpx;
	border-radius: 30rpx;
	margin-bottom: 30rpx;
	text-align: center;
	border: 1rpx solid rgba(86, 119, 252, 0.2);
	box-shadow: 0 4rpx 10rpx rgba(86, 119, 252, 0.05);
}

.status-text {
	font-size: 26rpx;
	font-weight: bold;
}

.status-pending {
	color: #FF9500;
}

.status-ready {
	color: #5677fc;
}

.status-success {
	color: #07c160;
}

.status-warning {
	color: #FF9500;
}

.status-error {
	color: #FF5E3A;
}

.video-controls {
	display: flex;
	justify-content: space-between;
	padding: 10rpx 0 30rpx;
	border-bottom: 1rpx dashed #e0e0e0;
	margin-bottom: 30rpx;
	
	.btn-text {
		margin-left: 10rpx;
		font-size: 26rpx;
	}
}

.monitor-info {
	background-color: #ffffff;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06);
	background-image: linear-gradient(to bottom right, rgba(86, 119, 252, 0.05), rgba(86, 119, 252, 0.1));
	
	.info-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
		border-bottom: 1rpx solid #f0f0f0;
		padding-bottom: 20rpx;
		
		.info-title {
			font-size: 30rpx;
			font-weight: bold;
			color: #333;
			margin-left: 10rpx;
			letter-spacing: 1px;
		}
	}
	
	.info-content {
		.info-item {
			display: flex;
			margin-bottom: 20rpx;
			align-items: flex-start;
			
			.info-text {
				font-size: 26rpx;
				color: #666;
				margin-left: 15rpx;
				line-height: 1.7;
				flex: 1;
			}
		}
	}
}

.camera-details {
	background-color: #ffffff;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06);
	
	.detail-item {
		display: flex;
		margin-bottom: 15rpx;
		
		.detail-label {
			width: 160rpx;
			font-size: 26rpx;
			color: #999;
		}
		
		.detail-value {
			flex: 1;
			font-size: 26rpx;
			color: #333;
			font-weight: bold;
		}
		
		.status-online {
			color: #07c160;
		}
	}
}

.debug-toggle {
	text-align: center;
	margin: 20rpx 0;
	
	.debug-text {
		font-size: 24rpx;
		color: #999;
		background-color: rgba(0,0,0,0.05);
		padding: 8rpx 30rpx;
		border-radius: 30rpx;
		transition: background-color 0.3s ease;
		
		&:active {
			background-color: rgba(0,0,0,0.1);
		}
	}
}

.debug-info {
	background-color: #f5f7fa;
	border-radius: 20rpx;
	padding: 24rpx;
	margin: 0 30rpx 30rpx;
	box-shadow: 0 6rpx 20rpx rgba(0,0,0,0.05);
	
	.debug-item {
		margin-bottom: 20rpx;
		
		.debug-label {
			font-size: 24rpx;
			color: #666;
			font-weight: bold;
			margin-bottom: 8rpx;
			display: block;
		}
		
		.debug-value {
			font-size: 24rpx;
			color: #333;
			background-color: rgba(0,0,0,0.05);
			padding: 10rpx 16rpx;
			border-radius: 10rpx;
			display: block;
			word-break: break-all;
		}
	}
	
	.debug-actions {
		margin-top: 24rpx;
		display: flex;
		justify-content: center;
	}
}
</style>
