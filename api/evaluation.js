import request from '@/utils/request.js'

// 提交评价
export const submitEvaluation = (data) => {
  return request.post('/api/evaluations', data)
}

// 获取菜单的评价列表
export const getMenuEvaluations = (menuId, page = 1, size = 10) => {
  return request.get(`/api/evaluations/menu/${menuId}`, { page, size })
}

// 获取菜单的平均评分
export const getMenuAverageRating = (menuId) => {
  return request.get(`/api/evaluations/statistics/average-rating/menu/${menuId}`)
}

// 获取用户的评价列表
export const getUserEvaluations = (userId, page = 1, size = 10) => {
  return request.get(`/api/evaluations/user/${userId}`, { page, size })
}

// 获取所有菜单的评分排行
export const getMenuRatingRanking = (page = 1, size = 20) => {
  // 由于后端可能没有直接提供排行API，前端模拟实现
  // 实际项目中应该由后端提供专门的排行接口
  return new Promise((resolve, reject) => {
    request.get('/api/menu', { page, size: 50 })
      .then(menuRes => {
        if (menuRes.code === 200 && menuRes.data && menuRes.data.records) {
          const menuPromises = menuRes.data.records.map(menu => 
            getMenuAverageRating(menu.id)
              .then(ratingRes => {
                return {
                  ...menu,
                  avgRating: ratingRes.code === 200 ? ratingRes.data : 0
                };
              })
              .catch(() => {
                return {
                  ...menu,
                  avgRating: 0
                };
              })
          );
          
          Promise.all(menuPromises)
            .then(menusWithRating => {
              // 按平均分从高到低排序
              const sortedMenus = menusWithRating.sort((a, b) => b.avgRating - a.avgRating);
              // 分页处理
              const start = (page - 1) * size;
              const end = page * size;
              const paginatedMenus = sortedMenus.slice(start, end);
              
              resolve({
                code: 200,
                message: '操作成功',
                data: {
                  records: paginatedMenus,
                  total: sortedMenus.length,
                  size: size,
                  current: page,
                  pages: Math.ceil(sortedMenus.length / size)
                }
              });
            })
            .catch(error => {
              reject({
                code: 500,
                message: '获取评分排行失败',
                error
              });
            });
        } else {
          reject({
            code: menuRes.code || 500,
            message: menuRes.message || '获取菜单列表失败'
          });
        }
      })
      .catch(error => {
        reject({
          code: 500,
          message: '获取菜单列表失败',
          error
        });
      });
  });
};

export default {
  submitEvaluation,
  getMenuEvaluations,
  getMenuAverageRating,
  getUserEvaluations,
  getMenuRatingRanking
} 