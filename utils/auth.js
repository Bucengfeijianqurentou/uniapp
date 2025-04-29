/**
 * 用户认证工具类
 */

// 保存token
export function saveToken(token) {
  uni.setStorageSync('token', token);
}

// 获取token
export function getToken() {
  return uni.getStorageSync('token');
}

// 保存用户信息
export function saveUserInfo(userInfo) {
  uni.setStorageSync('userInfo', userInfo);
}

// 获取用户信息
export function getUserInfo() {
  return uni.getStorageSync('userInfo');
}

// 清除登录信息
export function clearLoginInfo() {
  uni.removeStorageSync('token');
  uni.removeStorageSync('userInfo');
}

// 检查是否已登录
export function isLoggedIn() {
  return !!getToken();
}

// 检查登录并跳转
export function checkLogin(redirectUrl = '/pages/login/login') {
  if (!isLoggedIn()) {
    uni.navigateTo({
      url: redirectUrl
    });
    return false;
  }
  return true;
}

// 获取授权请求头
export function getAuthHeader() {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// 处理登录过期
export function handleTokenExpired() {
  clearLoginInfo();
  uni.showToast({
    title: '登录已过期，请重新登录',
    icon: 'none'
  });
  setTimeout(() => {
    uni.navigateTo({
      url: '/pages/login/login'
    });
  }, 1500);
} 