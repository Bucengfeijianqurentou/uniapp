<script>
	export default {
		onLaunch: function() {
			console.log('App Launch - 中小学食堂监管平台启动')
			// 初始化ThorUI相关配置
			this.initApp()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			initApp() {
				// 这里可以进行应用初始化配置
				console.log('应用初始化完成')
				
				// 创建自定义底部导航图标（实际项目中应该从设计资源获取）
				// 这里为了演示，先使用占位图标
				this.createTabBarIcons()
			},
			
			// 创建测试用的底部导航图标
			createTabBarIcons() {
				console.log('创建tabbar图标')
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
	page {
		font-size: 28rpx;
		color: #333;
		background-color: #f8f8f8;
		font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica,
			Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei',
			sans-serif;
	}

	/* 去除按钮默认边框 */
	button::after {
		border: none;
	}

	/* 统一边距 */
	.container {
		padding: 20rpx;
	}

	/* 文本溢出省略号 */
	.text-ellipsis {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	/* 清除浮动 */
	.clearfix:after {
		content: '';
		display: block;
		clear: both;
	}

	/* 主题色相关 */
	.primary-color {
		color: #5677fc;
	}
	.primary-bg {
		background-color: #5677fc;
	}
	
	/* 页面通用样式 */
	.page-container {
		padding-bottom: 120rpx;
	}
</style>
