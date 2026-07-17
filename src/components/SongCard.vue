<template>
  <div class="song-card" @click="handlePlay" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
    <div class="card-inner" :style="cardStyle">
      <div class="card-cover">
        <img :src="localCoverUrl" alt="封面" class="cover-image" />
        <div class="cover-overlay">
          <div class="play-button">
            <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
        </div>
        <div class="hot-tag" v-if="song.isHot === 1">
          <span class="tag-fire">🔥</span>
          <span>热门</span>
        </div>
        <div class="card-glow"></div>
      </div>
      
      <div class="card-info">
        <h3 class="song-name">{{ song.name }}</h3>
        <p class="song-artist">{{ song.artist }}</p>
        <p class="song-album">{{ song.album }}</p>
      </div>
      
      <div class="card-actions">
        <button 
          class="action-btn favorite-btn" 
          @click.stop="handleFavorite"
          :class="{ favorited: isFavorited }"
        >
          <svg v-if="!isFavorited" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
      
      <div class="card-footer">
        <div class="play-count">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <span>{{ formatPlays(song.plays) }}</span>
        </div>
        <span class="duration">{{ formatDuration(song.duration) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { inject } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useUserStore } from '@/stores/user'
import { addFavorite, removeFavorite, checkFavorite } from '@/api/favorite'
import { normalizeSong } from '@/utils/song'
import { getMyhkSongInfo } from '@/api/myhk'

const props = defineProps({
  song: {
    type: Object,
    required: true
  },
  songList: {
    type: Array,
    default: () => []
  },
  playSource: {
    type: String,
    default: ''
  }
})

const playerStore = usePlayerStore()
const userStore = useUserStore()
const isFavorited = ref(false)
const showLoginModal = inject('showLoginModal')
const toast = inject('toast')

const mouseX = ref(0)
const mouseY = ref(0)
const localCoverUrl = ref(props.song.coverUrl || '')

function isDefaultCover(url) {
  if (!url) return true
  if (url.includes('text_to_image')) return true
  if (url.startsWith('https://p1.music.126.net/') && url.includes('/10995116') && url.endsWith('.jpg')) {
    return true
  }
  return false
}

async function loadRealCover() {
  if (!props.song.id) return
  
  try {
    const res = await getMyhkSongInfo(props.song.id)
    if (res && res.code === 1 && res.data && res.data.pic) {
      localCoverUrl.value = res.data.pic
    }
  } catch (e) {
    console.warn('加载封面失败:', props.song.id)
  }
}

const cardStyle = computed(() => {
  if (mouseX.value === 0 && mouseY.value === 0) {
    return {}
  }
  const rotateX = (mouseY.value - 120) / 20
  const rotateY = (mouseX.value - 120) / 20
  return {
    transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`
  }
})

function handleMouseMove(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  mouseX.value = e.clientX - rect.left
  mouseY.value = e.clientY - rect.top
}

function handleMouseLeave() {
  mouseX.value = 0
  mouseY.value = 0
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    checkFavoriteStatus()
  }
  
  if (isDefaultCover(localCoverUrl.value)) {
    loadRealCover()
  }
})

async function checkFavoriteStatus() {
  try {
    const res = await checkFavorite(props.song.id)
    if (res.code === 200) {
      isFavorited.value = res.data.isFavorite
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

function handlePlay() {
    const normalizedSong = normalizeSong(props.song)
    if (normalizedSong) {
      playerStore.play(normalizedSong, props.playSource, props.songList)
    }
  }

async function handleFavorite() {
  if (!userStore.isLoggedIn) {
    showLoginModal.value = true
    return
  }
  
  try {
    if (isFavorited.value) {
      const res = await removeFavorite(props.song.id)
      if (res.code === 200) {
        isFavorited.value = false
        toast.value = { show: true, message: '取消收藏成功' }
      }
    } else {
      const res = await addFavorite({ songId: props.song.id })
      if (res.code === 200) {
        isFavorited.value = true
        toast.value = { show: true, message: '添加收藏成功' }
      }
    }
    setTimeout(() => toast.value.show = false, 2000)
  } catch (error) {
    toast.value = { show: true, message: '操作失败，请重试' }
    setTimeout(() => toast.value.show = false, 2000)
  }
}

function formatPlays(plays) {
  if (plays >= 10000) {
    return (plays / 10000).toFixed(1) + '万'
  }
  return plays.toString()
}

function formatDuration(duration) {
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.song-card {
  perspective: 1000px;
  cursor: pointer;
}

.card-inner {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.card-inner:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 30px 80px rgba(102, 126, 234, 0.25);
}

.card-cover {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
}

.cover-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.card-inner:hover .cover-image {
  transform: scale(1.1);
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.4s ease;
  backdrop-filter: blur(5px);
}

.card-inner:hover .cover-overlay {
  opacity: 1;
}

.play-button {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.8);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.5);
}

.card-inner:hover .play-button {
  transform: scale(1);
}

.play-button:hover {
  transform: scale(1.1);
  box-shadow: 0 15px 50px rgba(102, 126, 234, 0.6);
}

.play-icon {
  width: 28px;
  height: 28px;
  color: #fff;
  margin-left: 3px;
}

.hot-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.9), rgba(238, 90, 90, 0.9));
  color: #fff;
  padding: 5px 12px;
  border-radius: 18px;
  font-size: 11px;
  font-weight: 700;
  z-index: 2;
  animation: tagPulse 2s ease-in-out infinite;
}

@keyframes tagPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.tag-fire {
  font-size: 14px;
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), transparent);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.card-inner:hover .card-glow {
  opacity: 1;
}

.card-info {
  padding: 18px;
}

.song-name {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fff;
}

.song-artist {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 5px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-album {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  opacity: 0;
  transition: all 0.4s ease;
  z-index: 2;
}

.card-inner:hover .card-actions {
  opacity: 1;
}

.action-btn {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(102, 126, 234, 0.9);
  color: #fff;
  transform: scale(1.1);
}

.favorite-btn.favorited {
  color: #ff6b6b;
}

.favorite-btn.favorited:hover {
  background: rgba(255, 107, 107, 0.9);
}

.action-btn svg {
  width: 19px;
  height: 19px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 18px 18px;
}

.play-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.play-count svg {
  width: 14px;
  height: 14px;
}

.duration {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}
</style>