import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { normalizeSong } from '@/utils/song'
import { getSongPlayUrl } from '@/api/song'
import { getMyhkSongInfo } from '@/api/myhk'

export const usePlayerStore = defineStore('player', () => {
  const currentSong = ref(null)
  const isPlaying = ref(false)
  const progress = ref(0)
  const volume = ref(70)
  const playlist = ref([])
  const currentIndex = ref(-1)
  const audioRef = ref(null)
  const isLoading = ref(false)
  const playSource = ref('')
  const playSourceList = ref([])
  const duration = ref(0)
  const currentTime = ref(0)

  const hasNext = computed(() => {
    if (playSource.value && playSourceList.value.length > 0) {
      return currentIndex.value < playSourceList.value.length - 1
    }
    return currentIndex.value < playlist.value.length - 1
  })

  const hasPrev = computed(() => currentIndex.value > 0)

  function setAudioRef(ref) {
    audioRef.value = ref
  }

  function setDuration(value) {
    duration.value = value
  }

  function setCurrentTime(value) {
    currentTime.value = value
  }

  function isDefaultCover(url) {
    if (!url) return true
    if (url.includes('text_to_image')) return true
    if (url.startsWith('https://p1.music.126.net/') && url.includes('/10995116') && url.endsWith('.jpg')) {
      return true
    }
    return false
  }

  async function play(song, source = '', sourceList = []) {
    const normalizedSong = normalizeSong(song)
    if (!normalizedSong) return
    
    isLoading.value = true
    
    if (!normalizedSong.audioUrl || !normalizedSong.audioUrl.startsWith('http')) {
      const playUrl = await getSongPlayUrl(normalizedSong)
      if (playUrl) {
        normalizedSong.audioUrl = playUrl
      }
    }
    
    if (isDefaultCover(normalizedSong.coverUrl)) {
      try {
        const infoRes = await getMyhkSongInfo(normalizedSong.id)
        if (infoRes && infoRes.code === 1 && infoRes.data && infoRes.data.pic) {
          normalizedSong.coverUrl = infoRes.data.pic
        }
      } catch (e) {
        console.warn('获取播放器封面失败:', normalizedSong.id)
      }
    }
    
    if (source && sourceList.length > 0) {
      playSource.value = source
      playSourceList.value = sourceList.map(s => normalizeSong(s))
      const index = playSourceList.value.findIndex(s => s.id === normalizedSong.id)
      currentIndex.value = index >= 0 ? index : 0
    } else {
      playSource.value = ''
      playSourceList.value = []
    }
    
    currentSong.value = normalizedSong
    
    if (!playSource.value) {
      const index = playlist.value.findIndex(s => s.id === normalizedSong.id)
      if (index === -1) {
        playlist.value.push(normalizedSong)
        currentIndex.value = playlist.value.length - 1
      } else {
        playlist.value[index] = normalizedSong
        currentIndex.value = index
      }
    }
    
    isPlaying.value = true
    isLoading.value = false
  }

  function pause() {
    isPlaying.value = false
  }

  function toggle() {
    isPlaying.value = !isPlaying.value
  }

  async function next() {
    let song = null
    
    if (playSource.value && playSourceList.value.length > 0) {
      if (currentIndex.value < playSourceList.value.length - 1) {
        currentIndex.value++
        song = playSourceList.value[currentIndex.value]
      } else {
        currentIndex.value = 0
        song = playSourceList.value[0]
      }
    } else {
      if (currentIndex.value < playlist.value.length - 1) {
        currentIndex.value++
        song = playlist.value[currentIndex.value]
      } else {
        currentIndex.value = 0
        song = playlist.value[0]
      }
    }
    
    if (song) {
      const normalizedSong = normalizeSong(song)
      
      if (!normalizedSong.audioUrl || !normalizedSong.audioUrl.startsWith('http')) {
        const playUrl = await getSongPlayUrl(normalizedSong)
        if (playUrl) {
          normalizedSong.audioUrl = playUrl
        }
      }
      
      if (isDefaultCover(normalizedSong.coverUrl)) {
        try {
          const infoRes = await getMyhkSongInfo(normalizedSong.id)
          if (infoRes && infoRes.code === 1 && infoRes.data && infoRes.data.pic) {
            normalizedSong.coverUrl = infoRes.data.pic
          }
        } catch (e) {
          console.warn('获取播放器封面失败:', normalizedSong.id)
        }
      }
      
      currentSong.value = normalizedSong
      isPlaying.value = true
    }
  }

  async function prev() {
    let song = null
    
    if (playSource.value && playSourceList.value.length > 0) {
      if (currentIndex.value > 0) {
        currentIndex.value--
        song = playSourceList.value[currentIndex.value]
      } else {
        currentIndex.value = playSourceList.value.length - 1
        song = playSourceList.value[currentIndex.value]
      }
    } else {
      if (currentIndex.value > 0) {
        currentIndex.value--
        song = playlist.value[currentIndex.value]
      } else {
        currentIndex.value = playlist.value.length - 1
        song = playlist.value[currentIndex.value]
      }
    }
    
    if (song) {
      const normalizedSong = normalizeSong(song)
      
      if (!normalizedSong.audioUrl || !normalizedSong.audioUrl.startsWith('http')) {
        const playUrl = await getSongPlayUrl(normalizedSong)
        if (playUrl) {
          normalizedSong.audioUrl = playUrl
        }
      }
      
      if (isDefaultCover(normalizedSong.coverUrl)) {
        try {
          const infoRes = await getMyhkSongInfo(normalizedSong.id)
          if (infoRes && infoRes.code === 1 && infoRes.data && infoRes.data.pic) {
            normalizedSong.coverUrl = infoRes.data.pic
          }
        } catch (e) {
          console.warn('获取播放器封面失败:', normalizedSong.id)
        }
      }
      
      currentSong.value = normalizedSong
      isPlaying.value = true
    }
  }

  function setProgress(value) {
    progress.value = value
  }

  function setVolume(value) {
    volume.value = value
  }

  function addToPlaylist(song) {
    const normalizedSong = normalizeSong(song)
    if (!normalizedSong) return
    if (!playlist.value.find(s => s.id === normalizedSong.id)) {
      playlist.value.push(normalizedSong)
    }
  }

  function clearPlaylist() {
    playlist.value = []
    playSource.value = ''
    playSourceList.value = []
    currentIndex.value = -1
    currentSong.value = null
    isPlaying.value = false
    progress.value = 0
  }

  return {
    currentSong,
    isPlaying,
    progress,
    volume,
    playlist,
    currentIndex,
    audioRef,
    isLoading,
    playSource,
    playSourceList,
    duration,
    currentTime,
    hasNext,
    hasPrev,
    setAudioRef,
    setDuration,
    setCurrentTime,
    play,
    pause,
    toggle,
    next,
    prev,
    setProgress,
    setVolume,
    addToPlaylist,
    clearPlaylist
  }
})