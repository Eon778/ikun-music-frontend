import request from '@/utils/request'
import { getMockHotSongs, getMockAllSongs, searchMockSongs } from '@/mock/songs'
import { searchMyhkSongs, getMyhkToplist, getMyhkSongUrl, getMyhkSongInfo } from './myhk'
import { normalizeSong, normalizeSongList } from '@/utils/song'

function timeoutPromise(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout')), ms)
    promise.then(
      result => {
        clearTimeout(timer)
        resolve(result)
      },
      error => {
        clearTimeout(timer)
        reject(error)
      }
    )
  })
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function convertMyhkToplistData(data) {
  if (!data || !data.songId || !Array.isArray(data.songId)) return []
  
  const songs = []
  const length = data.songId.length
  
  for (let i = 0; i < length; i++) {
    songs.push({
      id: data.songId[i],
      name: data.songName ? data.songName[i] : '',
      album: data.albumName ? data.albumName[i] : '',
      artist: data.artistName ? data.artistName[i] : '',
      type: data.type ? data.type[i] : 'wy'
    })
  }
  
  return songs
}

async function fetchSongInfo(song) {
  try {
    const infoRes = await timeoutPromise(getMyhkSongInfo(song.id), 5000)
    if (infoRes && infoRes.code === 1 && infoRes.data) {
      const picUrl = infoRes.data.pic || ''
      return {
        ...song,
        coverUrl: picUrl,
        pic: picUrl,
        picid: infoRes.data.picid
      }
    }
  } catch (e) {
    console.warn('获取歌曲信息失败:', song.id)
  }
  return song
}

async function fetchSongCoversBatch(songs) {
  const results = []
  
  for (let i = 0; i < songs.length; i++) {
    if (i > 0) {
      await delay(80)
    }
    const result = await fetchSongInfo(songs[i])
    results.push(result)
  }
  
  return results
}

async function fetchAllSongCovers(songs) {
  const batchSize = 40
  const batches = []
  
  for (let i = 0; i < songs.length; i += batchSize) {
    batches.push(songs.slice(i, i + batchSize))
  }
  
  const promises = batches.map((batch, index) => {
    return new Promise(resolve => {
      setTimeout(async () => {
        const result = await fetchSongCoversBatch(batch)
        resolve(result)
      }, index * 200)
    })
  })
  
  const results = await Promise.all(promises)
  const flatResults = results.flat()
  
  return normalizeSongList(flatResults)
}

async function handleMyhkResponse(res) {
  if (res && res.code === 1 && res.data) {
    let songs = []
    
    if (Array.isArray(res.data)) {
      songs = res.data
    } else if (res.data.songId && Array.isArray(res.data.songId)) {
      songs = convertMyhkToplistData(res.data)
    } else if (res.data.songs && Array.isArray(res.data.songs)) {
      songs = res.data.songs
    } else {
      songs = [res.data]
    }
    
    return normalizeSongList(songs)
  }
  return null
}

let cachedToplist = null
let cachedToplistTime = 0
const searchCache = new Map()
const SEARCH_CACHE_TIME = 5 * 60 * 1000

async function getCachedToplist() {
  const now = Date.now()
  if (cachedToplist && now - cachedToplistTime < 60000) {
    return cachedToplist
  }
  
  const myhkRes = await timeoutPromise(getMyhkToplist(3778678), 10000)
  const songs = await handleMyhkResponse(myhkRes)
  
  if (songs && songs.length > 0) {
    cachedToplist = songs
    cachedToplistTime = now
    
    fetchAllSongCovers(songs).then(updatedSongs => {
      cachedToplist = updatedSongs
      cachedToplistTime = Date.now()
      console.log('所有歌曲封面更新完成:', updatedSongs.length, '首')
    })
  }
  
  return songs
}

export async function getSongList() {
  try {
    const myhkSongs = await getCachedToplist()
    if (myhkSongs && myhkSongs.length > 0) {
      console.log('使用明月浩空API获取歌曲列表')
      return { code: 200, data: { songs: myhkSongs } }
    }
  } catch (error) {
    console.log('明月浩空API不可用，尝试后端API')
  }

  try {
    const res = await request({
      url: '/songs',
      method: 'get'
    })
    return res
  } catch (error) {
    console.log('后端API不可用，使用mock数据')
    return { code: 200, data: { songs: normalizeSongList(getMockAllSongs()) } }
  }
}

export async function getHotSongs() {
  try {
    const myhkSongs = await getCachedToplist()
    if (myhkSongs && myhkSongs.length > 0) {
      console.log('使用明月浩空API获取热门歌曲')
      const hotSongs = myhkSongs.slice(0, 8)
      
      const hotSongsWithCovers = await fetchSongCoversBatch(hotSongs)
      const normalized = normalizeSongList(hotSongsWithCovers)
      
      cachedToplist = [...normalized, ...myhkSongs.slice(8)]
      cachedToplistTime = Date.now()
      
      return { code: 200, data: { songs: normalized } }
    }
  } catch (error) {
    console.log('明月浩空API不可用，尝试后端API')
  }

  try {
    const res = await request({
      url: '/songs/hot',
      method: 'get'
    })
    return res
  } catch (error) {
    console.log('后端API不可用，使用mock数据')
    return { code: 200, data: { songs: normalizeSongList(getMockHotSongs()) } }
  }
}

export async function searchSongs(keyword) {
  const cacheKey = keyword.trim().toLowerCase()
  const now = Date.now()
  
  if (searchCache.has(cacheKey)) {
    const cached = searchCache.get(cacheKey)
    if (now - cached.time < SEARCH_CACHE_TIME) {
      console.log('使用搜索缓存:', keyword)
      return { code: 200, data: { songs: cached.songs } }
    }
    searchCache.delete(cacheKey)
  }
  
  try {
    const myhkRes = await timeoutPromise(searchMyhkSongs(keyword), 10000)
    let myhkSongs = await handleMyhkResponse(myhkRes)
    if (myhkSongs && myhkSongs.length > 0) {
      console.log('明月浩空API搜索结果:', myhkSongs.length, '首')
      
      searchCache.set(cacheKey, { songs: myhkSongs, time: now })
      
      fetchAllSongCovers(myhkSongs).then(updatedSongs => {
        searchCache.set(cacheKey, { songs: updatedSongs, time: Date.now() })
      })
      
      return { code: 200, data: { songs: myhkSongs } }
    }
  } catch (error) {
    console.log('明月浩空搜索API不可用，尝试后端API')
  }

  try {
    const res = await request({
      url: '/songs/search',
      method: 'get',
      params: { keyword }
    })
    return res
  } catch (error) {
    console.log('后端API不可用，使用mock数据')
    const mockSongs = normalizeSongList(searchMockSongs(keyword))
    searchCache.set(cacheKey, { songs: mockSongs, time: now })
    return { code: 200, data: { songs: mockSongs } }
  }
}

export async function getSongById(id) {
  try {
    const res = await request({
      url: `/songs/${id}`,
      method: 'get'
    })
    return res
  } catch (error) {
    console.log('后端API不可用')
    return null
  }
}

export async function getSongPlayUrl(song) {
  if (!song || !song.id) return null

  try {
    const myhkRes = await timeoutPromise(getMyhkSongUrl(song.id), 10000)
    if (myhkRes && myhkRes.code === 1 && myhkRes.data) {
      const url = myhkRes.data
      if (url && typeof url === 'string') {
        console.log('获取到播放链接:', url)
        return url
      }
    }
  } catch (error) {
    console.log('明月浩空播放链接API不可用')
  }

  return null
}