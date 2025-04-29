# 食堂监督小程序

## 项目简介
这是一个基于uniapp框架开发的跨平台小程序，用于食堂监督管理。项目使用Vue 3作为开发框架，集成了ThorUI组件库，实现了美观的UI界面。

## 技术栈
- uniapp: 跨平台开发框架
- Vue 3: 前端框架
- ThorUI: UI组件库

## 项目结构
```
uniapp/
├── components/            # 自定义组件
├── pages/                 # 页面文件
│   └── index/             # 首页
├── static/                # 静态资源
├── unpackage/             # 打包输出目录
├── App.vue                # 应用入口
├── main.js                # 主入口文件
├── manifest.json          # 配置文件
├── pages.json             # 页面路由配置
└── uni.scss               # 全局样式变量
```

## ThorUI 组件使用
本项目集成了ThorUI组件库，使用方法如下：

1. 引入组件：通过easycom方式自动引入，无需单独import
2. 使用组件：直接在模板中使用`<tui-xxx></tui-xxx>`格式的标签
3. 示例：
   ```html
   <tui-button type="primary">按钮</tui-button>
   <tui-tag>标签</tui-tag>
   <tui-card title="卡片标题"></tui-card>
   ```

## 开发与运行
1. 安装依赖：
   ```bash
   npm install
   ```

2. 运行到浏览器：
   ```bash
   # HBuilderX中运行
   # 或使用命令行
   npm run dev:h5
   ```

3. 发布：
   ```bash
   # 在HBuilderX中发布到各平台
   ```

## 组件展示
项目首页展示了ThorUI的以下组件：
- 按钮组件 (tui-button)
- 标签组件 (tui-tag)
- 卡片组件 (tui-card)

更多组件将在后续功能中添加使用。 