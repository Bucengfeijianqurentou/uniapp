import { getAuthHeader } from '@/utils/auth.js';

// 用户登录
export async function login(data) {
  try {
    const response = await uni.request({
      url: 'http://localhost:8080/api/user/login',
      method: 'POST',
      data: {
        ...data,
        role: 'STUDENT_PARENT' // 固定角色
      },
      header: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('登录请求失败', error);
    throw error;
  }
}

// 获取用户信息
export async function getUserDetail(userId) {
  try {
    const response = await uni.request({
      url: `http://localhost:8080/api/user/${userId}`,
      method: 'GET',
      header: {
        ...getAuthHeader()
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('获取用户信息失败', error);
    throw error;
  }
}

// 更新用户信息
export async function updateUserInfo(userId, data) {
  try {
    const response = await uni.request({
      url: `http://localhost:8080/api/user/${userId}`,
      method: 'PUT',
      data,
      header: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('更新用户信息失败', error);
    throw error;
  }
}

// 修改密码
export async function changePassword(data) {
  try {
    const response = await uni.request({
      url: 'http://localhost:8080/api/user/changePassword',
      method: 'POST',
      data,
      header: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('修改密码失败', error);
    throw error;
  }
} 