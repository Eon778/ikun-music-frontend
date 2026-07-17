<template>
  <div class="my-music-page">
    <div v-if="!userStore.isLoggedIn" class="login-required">
      <div class="login-icon-wrapper">
        <div class="login-icon">🎵</div>
        <div class="icon-ring ring-1"></div>
        <div class="icon-ring ring-2"></div>
      </div>
      <h2 class="login-title">请先登录</h2>
      <p class="login-desc">登录后可以收藏和管理你的音乐</p>
      <button class="login-btn" @click="openLogin">
        <span>立即登录</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
          <polyline points="10 17 15 12 10 7"></polyline>
          <line x1="15" y1="12" x2="3" y2="12"></line>
        </svg>
      </button>
    </div>
    
    <div v-else class="content-wrapper">
      <section class="user-section">
        <div class="user-card">
          <div class="avatar-wrapper">
            <img :src="userStore.user.avatar" alt="头像" class="user-avatar" />
            <div class="avatar-ring"></div>
          </div>
          <div class="user-info">
            <h2 class="user-name">{{ userStore.user.nickname }}</h2>
            <p class="user-username">@{{ userStore.user.username }}</p>
            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-value">{{ favorites.length }}</span>
                <span class="stat-label">收藏</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">0</span>
                <span class="stat-label">关注</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">0</span>
                <span class="stat-label">粉丝</span>
              </div>
            </div>
          </div>
          <button class="logout-btn" @click="handleLogout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>退出登录</span>
          </button>
        </div>
      </section>
      
      <section class="favorites-section">
        <div class="section-header">
          <div class="header-left">
            <h2 class="section-title">❤️ 我的收藏</h2>
            <span class="section-count">{{ favorites.length }} 首歌曲</span>
          </div>
          <div class="header-decoration"></div>
        </div>
        
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        
        <div v-else-if="favorites.length > 0" class="favorites-list">
          <div 
            v-for="(song, index) in favorites" 
            :key="song.id" 
            class="favorite-item"
            :style="{ animationDelay: (index * 0.05) + 's' }"
            @click="handlePlay(song)"
          >
            <div class="item-index">{{ index + 1 }}</div>
            <img :src="song.coverUrl" alt="封面" class="song-cover" />
            <div class="song-info">
              <h4 class="song-name">{{ song.name }}</h4>
              <p class="song-artist">{{ song.artist }}</p>
              <p class="song-album">{{ song.album }}</p>
            </div>
            <div class="song-meta">
              <span class="play-count">{{ formatPlays(song.plays) }}</span>
              <span class="duration">{{ formatDuration(song.duration) }}</span>
            </div>
            <div class="song-actions">
              <button class="play-btn" @click.stop="handlePlay(song)">
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </button>
              <button class="remove-btn" @click.stop="handleRemove(song.id)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 15v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <div class="empty-icon">💔</div>
          <p class="empty-text">还没有收藏任何歌曲</p>
          <p class="empty-hint">去首页发现喜欢的音乐吧</p>
          <router-link to="/" class="explore-btn">
            <span>去发现</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePlayerStore } from '@/stores/player'
import { getFavoriteList, removeFavorite } from '@/api/favorite'
import { normalizeSongList } from '@/utils/song'

const router = useRouter()
const userStore = useUserStore()
const playerStore = usePlayerStore()
const showLoginModal = inject('showLoginModal')
const toast = inject('toast')

const favorites = ref([])
const isLoading = ref(false)

onMounted(() => {
  if (userStore.isLoggedIn) {
    loadFavorites()
  }
})

async function loadFavorites() {
  isLoading.value = true
  try {
    const res = await getFavoriteList()
    if (res.code === 200) {
      favorites.value = normalizeSongList(res.data.songs)
    }
  } catch (error) {
    console.error('加载收藏失败:', error)
  } finally {
    isLoading.value = false
  }
}

function openLogin() {
  showLoginModal.value = true
}

function handleLogout() {
  userStore.logout()
  router.push('/')
}

function handlePlay(song) {
  playerStore.play(song, 'favorite', favorites.value)
}

async function handleRemove(songId) {
  try {
    const res = await removeFavorite(songId)
    if (res.code === 200) {
      favorites.value = favorites.value.filter(s => s.id !== songId)
      toast.value = { show: true, message: '取消收藏成功' }
      setTimeout(() => toast.value.show = false, 2000)
    }
  } catch (error) {
    toast.value = { show: true, message: '操作失败，请重试' }
    setTimeout(() => toast.value.show = false, 2000)
  }
}

function formatDuration(duration) {
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function formatPlays(plays) {
  if (plays >= 10000) {
    return (plays / 10000).toFixed(1) + '万'
  }
  return plays.toString()
}
</script>

<style scoped>
.my-music-page {
  padding: 30px;
  max-width: 900px;
  margin: 0 auto;
}

.login-required {
  text-align: center;
  padding: 120px 20px;
}

.login-icon-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 35px;
}

.login-icon {
  font-size: 100px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.icon-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px solid rgba(102, 126, 234, 0.3);
}

.ring-1 {
  width: 140px;
  height: 140px;
  animation: ringPulse 3s ease-in-out infinite;
}

.ring-2 {
  width: 170px;
  height: 170px;
  animation: ringPulse 3s ease-in-out infinite 1s;
}

@keyframes ringPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.2;
  }
}

.login-title {
  font-size: 34px;
  font-weight: 700;
  margin: 0 0 15px 0;
}

.login-desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 35px 0;
}

.login-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  padding: 16px 45px;
  border-radius: 35px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 50px rgba(102, 126, 234, 0.5);
}

.login-btn svg {
  width: 18px;
  height: 18px;
}

.content-wrapper {
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-section {
  margin-bottom: 45px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 30px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-radius: 28px;
  padding: 35px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  position: relative;
  overflow: hidden;
}

.user-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.user-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(102, 126, 234, 0.4);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.avatar-ring {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  border: 2px dashed rgba(102, 126, 234, 0.4);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.user-username {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 20px 0;
}

.user-stats {
  display: flex;
  align-items: center;
  gap: 30px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 3px;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.2), transparent);
}

.logout-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 107, 107, 0.15);
  border: 1px solid rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
  padding: 12px 22px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 107, 107, 0.25);
  border-color: rgba(255, 107, 107, 0.5);
  transform: translateY(-2px);
}

.logout-btn svg {
  width: 16px;
  height: 16px;
}

.favorites-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 28px;
  padding: 35px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  margin: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 35px;
  position: relative;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.section-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0;
}

.section-count {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.header-decoration {
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, rgba(255, 107, 107, 0.5), transparent);
  border-radius: 2px;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.favorite-item {
  display: flex;
  align-items: center;
  gap: 18px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 18px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  animation: fadeInLeft 0.4s ease forwards;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.favorite-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(8px);
  border-color: rgba(102, 126, 234, 0.2);
}

.item-index {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
}

.song-cover {
  width: 65px;
  height: 65px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.song-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.song-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.song-artist {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.song-album {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

.song-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 0 0 100px;
}

.play-count,
.duration {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.song-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.play-btn {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  color: rgba(102, 126, 234, 0.8);
  cursor: pointer;
  padding: 12px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.play-btn:hover {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: transparent;
  color: #fff;
  transform: scale(1.1);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

.play-btn svg {
  width: 18px;
  height: 18px;
}

.remove-btn {
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.2);
  color: rgba(255, 107, 107, 0.6);
  cursor: pointer;
  padding: 12px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: rgba(255, 107, 107, 0.2);
  border-color: rgba(255, 107, 107, 0.4);
  color: #ff6b6b;
  transform: scale(1.1);
}

.remove-btn svg {
  width: 18px;
  height: 18px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 70px;
  margin-bottom: 25px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.empty-text {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.empty-hint {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 35px 0;
}

.explore-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  padding: 14px 35px;
  border-radius: 28px;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.explore-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
}

.explore-btn svg {
  width: 18px;
  height: 18px;
}
</style>