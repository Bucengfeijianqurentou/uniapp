<template>
	<view class="custom-tabbar">
		<view class="tabbar-box">
			<view 
				class="tabbar-item" 
				v-for="(item, index) in tabbarList" 
				:key="index" 
				@click="switchTab(index)"
			>
				<view class="icon-box">
					<tui-icon 
						:name="currentTab === index ? item.selectedIcon : item.icon" 
						:color="currentTab === index ? selectedColor : color" 
						:size="item.size || 26"
					></tui-icon>
				</view>
				<view 
					class="text" 
					:style="{color: currentTab === index ? selectedColor : color}"
				>{{item.text}}</view>
			</view>
		</view>
		<!-- 底部安全区域占位 -->
		<view class="tabbar-safe-area"></view>
	</view>
</template>

<script>
import { TuiIcon } from '../../utils/thorui.js'

export default {
	components: {
		TuiIcon
	},
	props: {
		currentTab: {
			type: Number,
			default: 0
		}
	},
	data() {
		return {
			color: '#666666',
			selectedColor: '#5677FC',
			backgroundColor: '#FFFFFF',
			tabbarList: [
				{
					text: '首页',
					icon: 'home',
					selectedIcon: 'home-fill',
					size: 28
				},
				{
					text: '加工处理',
					icon: 'explain',
					selectedIcon: 'explain-fill',
					size: 28
				},
				{
					text: '通知公告',
					icon: 'notice',
					selectedIcon: 'notice-fill',
					size: 28
				},
				{
					text: '个人中心',
					icon: 'people',
					selectedIcon: 'people-fill',
					size: 28
				}
			]
		}
	},
	methods: {
		switchTab(index) {
			if (this.currentTab !== index) {
				// 触发父组件更新当前标签页
				this.$emit('tabChange', index);
			}
		}
	}
}
</script>

<style>
.custom-tabbar {
	width: 100%;
	position: fixed;
	left: 0;
	bottom: 0;
	z-index: 9999;
	background-color: #FFFFFF;
	box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
}

.tabbar-box {
	width: 100%;
	height: 110rpx;
	display: flex;
	align-items: center;
	justify-content: space-around;
}

.tabbar-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 10rpx 0;
}

.icon-box {
	position: relative;
	margin-bottom: 4rpx;
}

.text {
	font-size: 24rpx;
	line-height: 1.5;
}

.tabbar-safe-area {
	width: 100%;
	height: 0;
}

/* 适配iPhone底部安全区域 */
@supports (bottom: constant(safe-area-inset-bottom)) {
	.tabbar-safe-area {
		height: constant(safe-area-inset-bottom);
	}
}
@supports (bottom: env(safe-area-inset-bottom)) {
	.tabbar-safe-area {
		height: env(safe-area-inset-bottom);
	}
}
</style> 