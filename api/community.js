import request from '@/utils/request.js'
import config from '@/config/config.js'

// 获取社区文章列表
export function getCommunityPosts(page = 1, size = 10) {
  return request.get('/api/community/posts', {
    current: page,
    size: size
  })
}

// 获取文章详情
export function getPostDetail(id) {
  return request.get(`/api/community/posts/${id}`)
}

// 发布文章
export function publishPost(data) {
  return request.post('/api/community/posts', data)
}

// 获取评论列表
export function getComments(postId, page = 1, size = 10) {
  return request.get(`/api/community/posts/${postId}/comments`, {
    current: page,
    size: size
  })
}

// 发表评论
export function publishComment(postId, data) {
  return request.post(`/api/community/posts/${postId}/comments`, data)
}

// 模拟数据 - 文章列表
export function getMockPosts() {
  return {
    code: 200,
    message: "操作成功",
    data: {
      records: [
        {
          id: 1,
          title: "建议增加水果种类",
          content: "我发现食堂的水果种类比较少，建议增加一些时令水果，如猕猴桃、草莓等，提高孩子们的维生素摄入。",
          authorId: 10,
          authorName: "王妈妈",
          publishTime: "2025-04-25 09:30:00",
          viewCount: 85,
          commentCount: 12,
          tags: ["建议", "营养均衡"]
        },
        {
          id: 2,
          title: "分享：如何培养孩子的健康饮食习惯",
          content: "最近和几位家长交流了培养孩子健康饮食习惯的经验，总结了几点分享给大家：1. 以身作则，父母先做好榜样；2. 带孩子了解食物的来源和营养价值；3. 让孩子参与简单的烹饪过程...",
          authorId: 15,
          authorName: "张爸爸",
          publishTime: "2025-04-23 14:20:00",
          viewCount: 126,
          commentCount: 18,
          tags: ["经验分享", "健康饮食"]
        },
        {
          id: 3,
          title: "感谢食堂改善伙食质量",
          content: "最近孩子回家经常提到学校食堂的饭菜越来越好吃了，特别是增加了一些新鲜蔬菜和水果，在此向食堂工作人员表示感谢！",
          authorId: 8,
          authorName: "李妈妈",
          publishTime: "2025-04-20 16:45:00",
          viewCount: 93,
          commentCount: 7,
          tags: ["感谢", "伙食改善"]
        },
        {
          id: 4,
          title: "孩子挑食怎么办？",
          content: "我家孩子特别挑食，尤其不爱吃绿色蔬菜，听说很多孩子在学校反而会跟着同学一起吃。有没有家长遇到类似情况，有什么好的解决方法吗？",
          authorId: 22,
          authorName: "赵爸爸",
          publishTime: "2025-04-18 10:15:00",
          viewCount: 156,
          commentCount: 24,
          tags: ["挑食", "求助"]
        },
        {
          id: 5,
          title: "建议食堂增加传统美食课程",
          content: "希望食堂能够定期举办一些传统美食制作的小课程，让孩子们了解中国传统饮食文化，增加对饮食的兴趣。",
          authorId: 13,
          authorName: "刘妈妈",
          publishTime: "2025-04-15 15:30:00",
          viewCount: 78,
          commentCount: 9,
          tags: ["传统文化", "建议"]
        }
      ],
      total: 32,
      size: 10,
      current: 1,
      pages: 4
    }
  }
}

// 模拟数据 - 文章详情
export function getMockPostDetail(id) {
  const posts = getMockPosts().data.records
  const post = posts.find(item => item.id == id) || posts[0]
  
  return {
    code: 200,
    message: "操作成功",
    data: {
      ...post,
      content: post.content + "\n\n作为家长，我希望学校食堂能够不断改进，为孩子们提供更加健康、美味的饮食。希望各位家长能够多多提出宝贵建议，共同监督和促进食堂的发展。"
    }
  }
}

// 模拟数据 - 评论列表
export function getMockComments(postId) {
  return {
    code: 200,
    message: "操作成功",
    data: {
      records: [
        {
          id: 1,
          postId: postId,
          content: "非常同意你的观点，我家孩子也很喜欢吃水果，多样化的水果选择确实很重要。",
          userId: 25,
          userName: "匿名用户",
          createTime: "2025-04-25 10:15:00"
        },
        {
          id: 2,
          postId: postId,
          content: "我认为学校应该根据季节变化调整水果供应，这样既能保证新鲜度又能控制成本。",
          userId: 16,
          userName: "匿名用户",
          createTime: "2025-04-25 11:23:00"
        },
        {
          id: 3,
          postId: postId,
          content: "希望食堂能定期公布每周水果供应计划，这样我们可以在家里做些补充。",
          userId: 9,
          userName: "匿名用户",
          createTime: "2025-04-25 14:50:00"
        },
        {
          id: 4,
          postId: postId,
          content: "支持这个建议！孩子正在长身体，多样化的水果对提高免疫力很有帮助。",
          userId: 31,
          userName: "匿名用户",
          createTime: "2025-04-26 09:05:00"
        }
      ],
      total: 4,
      size: 10,
      current: 1,
      pages: 1
    }
  }
} 