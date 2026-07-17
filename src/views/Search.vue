<template>
  <div class="search-page">
    <div class="search-header">
      <div class="search-box-container">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input 
          type="text" 
          class="search-input" 
          placeholder="搜索歌曲、歌手..." 
          v-model="keyword"
          @input="handleSearch"
          autofocus
        />
        <button v-if="keyword" class="clear-btn" @click="clearSearch">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="search-decoration-left"></div>
        <div class="search-decoration-right"></div>
      </div>
      
      <div class="hot-tags">
        <span class="tags-title">🔥 热门搜索</span>
        <button 
          v-for="(tag, index) in hotTags" 
          :key="tag" 
          class="tag-btn"
          :style="{ animationDelay: (index * 0.1) + 's' }"
          @click="searchTag(tag)"
        >
          {{ tag }}
        </button>
      </div>
    </div>
    
    <div class="search-results" v-if="keyword">
      <div class="results-header">
        <h2 class="results-title">搜索结果</h2>
        <span class="results-count">共找到 {{ searchResults.length }} 首歌曲</span>
      </div>
      
      <div v-if="searchResults.length > 0" class="results-grid">
        <SongCard 
          v-for="(song, index) in searchResults" 
          :key="song.id" 
          :song="song"
          :style="{ animationDelay: (index * 0.08) + 's' }"
        />
      </div>
      
      <div v-else class="empty-state">
        <div class="empty-icon">🔍</div>
        <p class="empty-text">没有找到相关歌曲</p>
        <p class="empty-hint">试试其他关键词吧</p>
        <div class="suggested-tags">
          <button 
            v-for="tag in suggestedTags" 
            :key="tag" 
            class="suggest-tag-btn"
            @click="searchTag(tag)"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </div>
    
    <div class="recommend-section" v-else>
      <h2 class="section-title">🎵 推荐歌曲</h2>
      <div class="song-list">
        <div 
          v-for="(song, index) in recommendSongs" 
          :key="song.id" 
          class="song-item"
          :style="{ animationDelay: (index * 0.05) + 's' }"
          @click="handlePlay(song)"
        >
          <div class="song-rank" :class="{ top: index < 3 }">{{ index + 1 }}</div>
          <img :src="getRecommendCover(song)" alt="封面" class="song-cover" />
          <div class="song-info">
            <h4 class="song-name">{{ song.name }}</h4>
            <p class="song-artist">{{ song.artist }}</p>
          </div>
          <div class="song-meta">
            <span class="play-count">{{ formatPlays(song.plays) }}</span>
            <span class="duration">{{ formatDuration(song.duration) }}</span>
          </div>
          <button class="play-btn" @click.stop="handlePlay(song)">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import SongCard from '@/components/SongCard.vue'
import { searchSongs, getSongList } from '@/api/song'
import { getMyhkSongInfo } from '@/api/myhk'
import { usePlayerStore } from '@/stores/player'

const route = useRoute()
const playerStore = usePlayerStore()

const keyword = ref('')
const searchResults = ref([])
const recommendSongs = ref([])
const recommendCovers = ref({})
const isSearching = ref(false)
let searchTimer = null

function isDefaultCover(url) {
  if (!url) return true
  if (url.includes('text_to_image')) return true
  if (url.startsWith('https://p1.music.126.net/') && url.includes('/10995116') && url.endsWith('.jpg')) {
    return true
  }
  return false
}

async function loadRecommendCover(song) {
  if (!song.id || recommendCovers.value[song.id]) return
  
  try {
    const res = await getMyhkSongInfo(song.id)
    if (res && res.code === 1 && res.data && res.data.pic) {
      recommendCovers.value[song.id] = res.data.pic
    }
  } catch (e) {
    console.warn('加载封面失败:', song.id)
  }
}

function getRecommendCover(song) {
  return recommendCovers.value[song.id] || song.coverUrl || ''
}

const hotTags = ['周杰伦', '蔡徐坤', '薛之谦', '夜曲', '只因你太美', '晴天', '七里香', '稻香']
const suggestedTags = ['音乐', '流行', '经典', '华语', '粤语']

onMounted(() => {
  loadRecommendSongs()
  
  const queryKeyword = route.query.keyword
  if (queryKeyword) {
    keyword.value = decodeURIComponent(queryKeyword)
    doSearch()
  }
})

watch(() => route.query.keyword, (newKeyword) => {
  if (newKeyword) {
    keyword.value = decodeURIComponent(newKeyword)
    doSearch()
  }
})

onUnmounted(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})

async function loadRecommendSongs() {
  try {
    const res = await getSongList()
    if (res.code === 200) {
      recommendSongs.value = res.data.songs.slice(0, 10)
      recommendSongs.value.forEach(song => {
        if (isDefaultCover(song.coverUrl)) {
          loadRecommendCover(song)
        }
      })
    }
  } catch (error) {
    console.error('加载推荐歌曲失败:', error)
  }
}

function handleSearch() {
  if (!keyword.value.trim()) {
    searchResults.value = []
    if (searchTimer) {
      clearTimeout(searchTimer)
      searchTimer = null
    }
    return
  }
  
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  
  searchTimer = setTimeout(() => {
    doSearch()
  }, 300)
}

async function doSearch() {
  if (!keyword.value.trim()) {
    searchResults.value = []
    return
  }
  
  isSearching.value = true
  
  try {
    const res = await searchSongs(keyword.value)
    if (res.code === 200) {
      searchResults.value = res.data.songs
    }
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    isSearching.value = false
  }
}

function clearSearch() {
  keyword.value = ''
  searchResults.value = []
  if (searchTimer) {
    clearTimeout(searchTimer)
    searchTimer = null
  }
}

function searchTag(tag) {
  keyword.value = tag
  doSearch()
}

function handlePlay(song) {
  playerStore.play(song)
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
.search-page {
  padding: 30px;
  max-width: 1100px;
  margin: 0 auto;
}

.search-header {
  margin-bottom: 50px;
}

.search-box-container {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 35px;
  padding: 16px 30px;
  margin-bottom: 35px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-box-container:focus-within {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 0 50px rgba(102, 126, 234, 0.15);
  transform: translateY(-3px);
}

.search-icon {
  width: 22px;
  height: 22px;
  color: rgba(255, 255, 255, 0.5);
  margin-right: 15px;
  transition: color 0.3s ease;
}

.search-box-container:focus-within .search-icon {
  color: #667eea;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 17px;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.clear-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
}

.clear-btn svg {
  width: 16px;
  height: 16px;
}

.search-decoration-left,
.search-decoration-right {
  position: absolute;
  top: 50%;
  width: 30px;
  height: 2px;
  background: rgba(102, 126, 234, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.search-decoration-left {
  left: 20px;
  transform: translateY(-50%) rotate(-45deg);
}

.search-decoration-right {
  right: 20px;
  transform: translateY(-50%) rotate(45deg);
}

.search-box-container:focus-within .search-decoration-left,
.search-box-container:focus-within .search-decoration-right {
  opacity: 1;
}

.hot-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.tags-title {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.tag-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  animation: fadeInUp 0.4s ease forwards;
}

.tag-btn:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
  border-color: rgba(102, 126, 234, 0.4);
  color: #fff;
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-results {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.results-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 35px;
}

.results-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0;
}

.results-count {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 25px;
}

.empty-state {
  text-align: center;
  padding: 100px 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 30px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.empty-text {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 15px 0;
}

.empty-hint {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 40px 0;
}

.suggested-tags {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

.suggest-tag-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(102, 126, 234, 0.4);
  color: rgba(102, 126, 234, 0.9);
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.suggest-tag-btn:hover {
  background: rgba(102, 126, 234, 0.15);
  border-style: solid;
  transform: translateY(-2px);
}

.recommend-section {
  animation: fadeIn 0.3s ease;
}

.section-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 35px 0;
}

.song-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 18px;
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

.song-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(8px);
  border-color: rgba(102, 126, 234, 0.2);
}

.song-rank {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
}

.song-rank.top {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}

.song-cover {
  width: 55px;
  height: 55px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.song-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.song-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.song-artist {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.song-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 0 0 120px;
}

.play-count,
.duration {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
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
  width: 20px;
  height: 20px;
}
</style>