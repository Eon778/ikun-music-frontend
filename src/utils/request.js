import axios from 'axios'

const isProduction = import.meta.env.PROD

const request = axios.create({
  baseURL: isProduction ? '' : '/api',
  timeout: isProduction ? 3000 : 10000
})

request.interceptors.request.use(
  config => {
    if (isProduction) {
      return Promise.reject(new Error('Production mode: no backend API'))
    }
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    return res
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

export default request
