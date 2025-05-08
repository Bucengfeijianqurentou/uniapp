// 接口基础配置
export default {
  baseUrl: 'http://localhost:8080',
  imageBaseUrl: 'http://localhost:8080',
  // 请求超时时间
  timeout: 10000,
  // 默认请求头
  header: {
    'Content-Type': 'application/json;charset=UTF-8'
  },
  // 监控配置
  monitor: {
    // RTSP视频流地址
    rtspUrl: 'rtsp://admin:123456@192.168.62.104:554/cam/realmonitor?channel=1&subtype=0',
    // WebRTC服务器地址
    webRtcServerUrl: 'http://localhost:8000'
  }
}