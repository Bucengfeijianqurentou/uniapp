import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
import ThorUI from './utils/thorui'
Vue.use(ThorUI)
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import { TuiButton, TuiTag, TuiCard, TuiIcon, TuiTabbar } from './utils/thorui'

export function createApp() {
  const app = createSSRApp(App)
  // 全局注册组件
  app.component('tui-button', TuiButton)
  app.component('tui-tag', TuiTag)
  app.component('tui-card', TuiCard)
  app.component('tui-icon', TuiIcon)
  app.component('tui-tabbar', TuiTabbar)
  return {
    app
  }
}
// #endif