import axios from 'axios'

const MYHK_API_KEY = import.meta.env.VITE_MYHK_API_KEY
const MYHK_API_BASE = '/myhk/open/music'

const myhkRequest = axios.create({
  baseURL: MYHK_API_BASE,
  timeout: 15000
})

myhkRequest.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

myhkRequest.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('明月浩空API请求错误:', error.response?.status, error.response?.config?.url)
    return Promise.reject(error)
  }
)

export async function searchMyhkSongs(keyword) {
  try {
    const res = await myhkRequest({
      url: '/search',
      method: 'get',
      params: {
        key: MYHK_API_KEY,
        name: keyword,
        type: 'wy',
        page: 1,
        limit: 20,
        format: 1
      }
    })
    console.log('明月浩空搜索API成功:', res)
    return res
  } catch (error) {
    console.warn('明月浩空搜索API失败:', error)
    return null
  }
}

export async function getMyhkSongInfo(songId) {
  try {
    const res = await myhkRequest({
      url: '/info',
      method: 'get',
      params: {
        key: MYHK_API_KEY,
        id: songId,
        type: 'wy',
        format: 1,
        url: 1,
        pic: 1
      }
    })
    console.log('明月浩空歌曲信息API成功:', res)
    return res
  } catch (error) {
    console.warn('明月浩空歌曲信息API失败:', error)
    return null
  }
}

export async function getMyhkSongUrl(songId) {
  try {
    const res = await myhkRequest({
      url: '/url',
      method: 'get',
      params: {
        key: MYHK_API_KEY,
        id: songId,
        type: 'wy',
        format: 1
      }
    })
    console.log('明月浩空MP3地址API成功:', res)
    return res
  } catch (error) {
    console.warn('明月浩空MP3地址API失败:', error)
    return null
  }
}

export async function getMyhkSongPic(songId) {
  try {
    const res = await myhkRequest({
      url: '/pic',
      method: 'get',
      params: {
        key: MYHK_API_KEY,
        id: songId,
        type: 'wy',
        format: 1
      }
    })
    console.log('明月浩空歌曲图片API成功:', res)
    return res
  } catch (error) {
    console.warn('明月浩空歌曲图片API失败:', error)
    return null
  }
}

export async function getMyhkToplist(toplistId = 3778678) {
  try {
    const res = await myhkRequest({
      url: '/toplist',
      method: 'get',
      params: {
        key: MYHK_API_KEY,
        id: toplistId,
        type: 'wy',
        format: 1
      }
    })
    console.log('明月浩空排行榜API成功:', res)
    return res
  } catch (error) {
    console.warn('明月浩空排行榜API失败:', error)
    return null
  }
}

export async function getMyhkSongLyric(songId) {
  try {
    const res = await myhkRequest({
      url: '/lrc',
      method: 'get',
      params: {
        key: MYHK_API_KEY,
        id: songId,
        type: 'wy',
        format: 1
      }
    })
    console.log('明月浩空歌词API成功:', res)
    return res
  } catch (error) {
    console.warn('明月浩空歌词API失败:', error)
    return null
  }
}

export async function testMyhkApi() {
  console.log('开始测试明月浩空API...')
  
  const searchRes = await searchMyhkSongs('周杰伦')
  console.log('搜索API结果:', searchRes)
  
  const toplistRes = await getMyhkToplist(3778678)
  console.log('排行榜API结果:', toplistRes)
  
  return { search: searchRes, toplist: toplistRes }
}