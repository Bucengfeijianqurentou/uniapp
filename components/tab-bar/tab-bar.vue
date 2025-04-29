<template>
	<view class="tab-bar-wrapper">
		<tui-tabbar :current="current" :tabBar="tabBar" unlined @click="tabbarClick"></tui-tabbar>
	</view>
</template>

<script>
import { TuiTabbar } from '../../utils/thorui.js'

export default {
	components: {
		TuiTabbar
	},
	data() {
		return {
			current: 0,
			tabBar: {
				color: "#666666",
				selectedColor: "#5677FC",
				backgroundColor: "#FFFFFF",
				borderStyle: "#F8F8F8",
				list: [{
					pagePath: "/pages/home/home",
					text: "首页",
					iconPath: "/static/images/tabbar/home.png",
					selectedIconPath: "/static/images/tabbar/home_selected.png"
				}, {
					pagePath: "/pages/process/process",
					text: "加工处理",
					iconPath: "/static/images/tabbar/process.png",
					selectedIconPath: "/static/images/tabbar/process_selected.png"
				}, {
					pagePath: "/pages/notice/notice",
					text: "通知公告",
					iconPath: "/static/images/tabbar/notice.png",
					selectedIconPath: "/static/images/tabbar/notice_selected.png"
				}, {
					pagePath: "/pages/user/user",
					text: "个人中心",
					iconPath: "/static/images/tabbar/user.png",
					selectedIconPath: "/static/images/tabbar/user_selected.png"
				}]
			}
		}
	},
	methods: {
		tabbarClick(e) {
			let index = e.index
			this.current = index
			uni.switchTab({
				url: this.tabBar.list[index].pagePath
			})
		}
	}
}
</script>

<style>
.tab-bar-wrapper {
	width: 100%;
	position: fixed;
	left: 0;
	bottom: 0;
	z-index: 9999;
}
</style> 