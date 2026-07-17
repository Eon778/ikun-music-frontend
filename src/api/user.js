import request from '@/utils/request'

const mockUsers = [
  { id: 1, username: 'admin', password: 'admin123', nickname: '管理员', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' },
  { id: 2, username: 'ikunfan', password: 'ikun123', nickname: 'IKUN粉丝', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ikunfan' }
]

let nextUserId = 3

export async function login(data) {
  try {
    const res = await request({
      url: '/user/login',
      method: 'post',
      data
    })
    return res
  } catch (error) {
    console.warn('后端API不可用，使用mock数据')
    const user = mockUsers.find(u => u.username === data.username && u.password === data.password)
    if (user) {
      const token = `mock-token-${user.id}-${Date.now()}`
      return { 
        code: 200, 
        message: '登录成功',
        data: { token, user } 
      }
    }
    return { code: 401, message: '用户名或密码错误' }
  }
}

export async function register(data) {
  try {
    const res = await request({
      url: '/user/register',
      method: 'post',
      data
    })
    return res
  } catch (error) {
    console.warn('后端API不可用，使用mock数据')
    if (mockUsers.find(u => u.username === data.username)) {
      return { code: 400, message: '用户名已存在' }
    }
    const newUser = {
      id: nextUserId++,
      username: data.username,
      password: data.password,
      nickname: data.nickname,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`
    }
    mockUsers.push(newUser)
    const token = `mock-token-${newUser.id}-${Date.now()}`
    return { 
      code: 200, 
      message: '注册成功',
      data: { token, user: newUser } 
    }
  }
}

export async function getUserInfo() {
  try {
    const res = await request({
      url: '/user/info',
      method: 'get'
    })
    return res
  } catch (error) {
    console.warn('后端API不可用，使用mock数据')
    return { code: 200, data: { user: mockUsers[0] } }
  }
}

export async function updateUser(data) {
  try {
    const res = await request({
      url: '/user/update',
      method: 'put',
      data
    })
    return res
  } catch (error) {
    console.warn('后端API不可用，使用mock数据')
    return { code: 200, message: '更新成功', data: { user: mockUsers[0] } }
  }
}