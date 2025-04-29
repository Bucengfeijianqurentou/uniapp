// 引入常用的ThorUI组件
import TuiButton from 'thorui-uni/lib/thorui/tui-button/tui-button.vue'
import TuiTag from 'thorui-uni/lib/thorui/tui-tag/tui-tag.vue'
import TuiCard from 'thorui-uni/lib/thorui/tui-card/tui-card.vue'
import TuiIcon from 'thorui-uni/lib/thorui/tui-icon/tui-icon.vue'
import TuiTabbar from 'thorui-uni/lib/thorui/tui-tabbar/tui-tabbar.vue'

// 导出组件列表
const components = [
  TuiButton,
  TuiTag,
  TuiCard,
  TuiIcon,
  TuiTabbar
]

// Vue插件安装方法
export default {
  install(Vue) {
    // 注册所有组件
    components.forEach(component => {
      Vue.component(component.name, component)
    })
  }
}

// 单独导出组件，方便按需引入
export {
  TuiButton,
  TuiTag,
  TuiCard,
  TuiIcon,
  TuiTabbar
} 