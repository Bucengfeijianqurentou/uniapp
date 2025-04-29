<template>
	<view class="main-container">
		<!-- 页面内容区 -->
		<view class="page-body">
			<!-- 首页 -->
			<view v-if="currentTab === 0" class="page-item">
				<home-page></home-page>
			</view>
			<!-- 加工处理页 -->
			<view v-if="currentTab === 1" class="page-item">
				<process-page></process-page>
			</view>
			<!-- 通知公告页 -->
			<view v-if="currentTab === 2" class="page-item">
				<notice-page></notice-page>
			</view>
			<!-- 个人中心页 -->
			<view v-if="currentTab === 3" class="page-item">
				<user-page></user-page>
			</view>
		</view>
		
		<!-- 底部导航栏 -->
		<custom-tabbar 
			:currentTab="currentTab"
			@tabChange="handleTabChange"
		></custom-tabbar>
	</view>
</template>

<script>
import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue'
import HomePage from '@/pages/home/home.vue'
import ProcessPage from '@/pages/process/process.vue'
import NoticePage from '@/pages/notice/notice.vue'
import UserPage from '@/pages/user/user.vue'

export default {
	components: {
		CustomTabbar,
		HomePage,
		ProcessPage,
		NoticePage,
		UserPage
	},
	data() {
		return {
			currentTab: 0
		}
	},
	methods: {
		handleTabChange(index) {
			this.currentTab = index
		}
	}
}
</script>

<style>
.main-container {
	width: 100%;
	min-height: 100vh;
	box-sizing: border-box;
}

.page-body {
	width: 100%;
	padding-bottom: 110rpx;
}

.page-item {
	width: 100%;
}
</style> 