<template>
	<view class="tab-bar">
		<view 
			class="tab-item" 
			v-for="(item, index) in tabList" 
			:key="index" 
			@tap="switchTab(index)"
			:class="{ active: current === index }"
		>
			<tui-icon 
				:name="current === index ? item.selectedIcon : item.icon" 
				:color="current === index ? selectedColor : color" 
				:size="40"
			></tui-icon>
			<text 
				class="tab-text" 
				:class="{ 'tab-text-active': current === index }"
			>
				{{ item.text }}
			</text>
		</view>
	</view>
</template>

<script>
import { TuiIcon } from '@/utils/thorui.js'

export default {
	name: 'tab-bar',
	components: {
		TuiIcon
	},
	props: {
		current: {
			type: Number,
			default: 0
		}
	},
	data() {
		return {
			color: '#999999',
			selectedColor: '#5677fc',
			tabList: [
				{
					pagePath: '/pages/home/home',
					text: '首页',
					icon: 'home',
					selectedIcon: 'home-fill'
				},
				{
					pagePath: '/pages/process/process',
					text: '加工处理',
					icon: 'setup',
					selectedIcon: 'setup-fill'
				},
				{
					pagePath: '/pages/notice/notice',
					text: '通知公告',
					icon: 'news',
					selectedIcon: 'news-fill'
				},
				{
					pagePath: '/pages/user/user',
					text: '个人中心',
					icon: 'people',
					selectedIcon: 'people-fill'
				}
			]
		}
	},
	methods: {
		switchTab(index) {
			if (this.current !== index) {
				// 记录要切换到的页面路径
				const targetPath = this.tabList[index].pagePath;
				
				// 使用uni.switchTab进行切换
				uni.switchTab({
					url: targetPath,
					success: () => {
						console.log('Tab切换成功到:', targetPath);
					},
					fail: (err) => {
						console.error('切换Tab失败:', err);
						
						// 失败时尝试使用redirectTo，这样能保证页面完全刷新
						uni.redirectTo({
							url: targetPath,
							success: () => {
								console.log('重定向成功到:', targetPath);
							},
							fail: (redirectErr) => {
								console.error('重定向也失败:', redirectErr);
								
								// 最后尝试navigateTo
								uni.navigateTo({
									url: targetPath,
									fail: (navErr) => {
										console.error('导航也失败:', navErr);
										uni.showToast({
											title: '页面跳转失败',
											icon: 'none'
										});
									}
								});
							}
						});
					}
				});
			}
		}
	}
}
</script>

<style>
.tab-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 120rpx;
	background: #ffffff;
	display: flex;
	border-top: 1rpx solid #f5f5f5;
	padding-bottom: env(safe-area-inset-bottom);
	z-index: 9999;
}

.tab-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-evenly;
	height: 100%;
	padding: 10rpx 0;
}

.tab-text {
	font-size: 24rpx;
	color: #999999;
	margin-top: 8rpx;
	line-height: 1;
}

.tab-text-active {
	color: #5677fc;
}

.active {
	font-weight: bold;
}
</style> 