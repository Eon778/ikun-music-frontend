import request from '@/utils/request'
import { getMyhkSongInfo } from './myhk'
import { normalizeSong } from '@/utils/song'
import { useUserStore } from '@/stores/user'

function getFavoriteKey(userId) {
  return `mock_favorites_${userId}`
}

function getFavoritesFromStorage() {
  const userStore = useUserStore()
  const userId = userStore.userId || localStorage.getItem('userId') || '1'
  const key = getFavoriteKey(userId)
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

function saveFavoritesToStorage(favorites) {
  const userStore = useUserStore()
  const userId = userStore.userId || localStorage.getItem('userId') || '1'
  const key = getFavoriteKey(userId)
  localStorage.setItem(key, JSON.stringify(favorites))
}

export async function getFavoriteList() {
  try {
    const res = await request({
      url: '/favorite/list',
      method: 'get'
    })
    return res
  } catch (error) {
    console.warn('后端API不可用，使用本地存储')
    const favoriteSongIds = getFavoritesFromStorage()
    
    if (favoriteSongIds.length === 0) {
      return { code: 200, data: { songs: [] } }
    }
    
    const songs = []
    const batchSize = 5
    for (let i = 0; i < favoriteSongIds.length; i += batchSize) {
      const batch = favoriteSongIds.slice(i, i + batchSize)
      const promises = batch.map(async (songId) => {
        try {
          const myhkRes = await getMyhkSongInfo(songId)
          if (myhkRes && myhkRes.code === 1 && myhkRes.data) {
            const song = normalizeSong(myhkRes.data)
            if (song) {
              return song
            }
          }
        } catch (e) {
          console.warn('获取歌曲详情失败:', songId, e)
        }
        return null
      })
      const results = await Promise.all(promises)
      results.forEach(song => {
        if (song) {
          songs.push(song)
        }
      })
    }
    
    return { code: 200, data: { songs } }
  }
}

export async function addFavorite(data) {
  try {
    const res = await request({
      url: '/favorite/add',
      method: 'post',
      data
    })
    return res
  } catch (error) {
    console.warn('后端API不可用，使用本地存储')
    const favorites = getFavoritesFromStorage()
    if (!favorites.includes(data.songId)) {
      favorites.push(data.songId)
      saveFavoritesToStorage(favorites)
    }
    return { code: 200, message: '收藏成功', data: {} }
  }
}

export async function removeFavorite(songId) {
  try {
    const res = await request({
      url: `/favorite/remove/${songId}`,
      method: 'delete'
    })
    return res
  } catch (error) {
    console.warn('后端API不可用，使用本地存储')
    const favorites = getFavoritesFromStorage()
    const index = favorites.indexOf(songId)
    if (index > -1) {
      favorites.splice(index, 1)
      saveFavoritesToStorage(favorites)
    }
    return { code: 200, message: '取消收藏成功', data: {} }
  }
}

export async function checkFavorite(songId) {
  try {
    const res = await request({
      url: `/favorite/check/${songId}`,
      method: 'get'
    })
    return res
  } catch (error) {
    console.warn('后端API不可用，使用本地存储')
    const favorites = getFavoritesFromStorage()
    return { code: 200, data: { isFavorite: favorites.includes(songId) } }
  }
}