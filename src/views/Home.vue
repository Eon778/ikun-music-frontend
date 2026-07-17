<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="particles-container">
        <div 
          v-for="particle in particles" 
          :key="particle.id"
          class="particle"
          :style="{
            left: particle.x + '%',
            top: particle.y + '%',
            width: particle.size + 'px',
            height: particle.size + 'px',
            animationDelay: particle.delay + 's',
            animationDuration: particle.duration + 's'
          }"
        ></div>
      </div>
      
      <div class="hero-content">
        <div class="hero-text">
          <div class="hero-badge">
            <span class="badge-icon">🎵</span>
            <span>IKUN官方音乐平台</span>
          </div>
          <h1 class="hero-title">
            <span class="title-gradient">IKUN音乐</span>
          </h1>
          <p class="hero-subtitle">只因你太美，聆听每一份感动</p>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-value">{{ songCount }}</span>
              <span class="stat-label">首歌曲</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">{{ hotCount }}</span>
              <span class="stat-label">首热门</span>
            </div>
          </div>
          <div class="hero-actions">
            <router-link to="/search" class="action-btn primary">
              <span>探索音乐</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </router-link>
            <router-link to="/my-music" class="action-btn secondary">
              <span>我的收藏</span>
            </router-link>
          </div>
        </div>
        
        <div class="hero-visual">
          <div class="album-cover-wrapper">
            <div class="album-cover">
              <img src="/hero-image.jpg" alt="IKUN音乐" />
              <div class="cover-shine"></div>
            </div>
            <div class="album-ring ring-1"></div>
            <div class="album-ring ring-2"></div>
            <div class="album-ring ring-3"></div>
          </div>
          
          <div class="floating-elements">
            <div class="floating-note note-1">🎵</div>
            <div class="floating-note note-2">🎶</div>
            <div class="floating-note note-3">✨</div>
          </div>
        </div>
      </div>
      
      <div class="hero-wave"></div>
    </section>
    
    <section class="hot-section">
      <div class="section-header">
        <div class="header-left">
          <h2 class="section-title">🔥 热门推荐</h2>
          <span class="section-subtitle">大家都在听</span>
        </div>
        <div class="header-decoration"></div>
      </div>
      <div class="song-grid">
        <SongCard 
          v-for="(song, index) in hotSongs" 
          :key="song.id" 
          :song="song"
          :song-list="hotSongs"
          play-source="hot"
          class="song-item"
          :style="{ animationDelay: (index * 0.1) + 's' }"
        />
      </div>
    </section>
    
    <section class="all-section">
      <div class="section-header">
        <div class="header-left">
          <h2 class="section-title">🎶 全部歌曲</h2>
          <span class="section-subtitle">发现更多好音乐</span>
        </div>
        <div class="header-decoration"></div>
      </div>
      <div class="song-grid">
        <SongCard 
          v-for="(song, index) in allSongs" 
          :key="song.id" 
          :song="song"
          :song-list="allSongs"
          play-source="all"
          class="song-item"
          :style="{ animationDelay: (index * 0.08) + 's' }"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SongCard from '@/components/SongCard.vue'
import { getHotSongs, getSongList } from '@/api/song'

const hotSongs = ref([])
const allSongs = ref([])
const songCount = ref(0)
const hotCount = ref(0)

const particles = ref([])

function generateParticles() {
  const newParticles = []
  for (let i = 0; i < 25; i++) {
    newParticles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10
    })
  }
  particles.value = newParticles
}

onMounted(() => {
  generateParticles()
  loadHotSongs()
  loadAllSongs()
})

async function loadHotSongs() {
  try {
    const res = await getHotSongs()
    if (res.code === 200) {
      hotSongs.value = res.data.songs
      hotCount.value = res.data.songs.length
    }
  } catch (error) {
    console.error('加载热门歌曲失败:', error)
  }
}

async function loadAllSongs() {
  try {
    const res = await getSongList()
    if (res.code === 200) {
      allSongs.value = res.data.songs
      songCount.value = res.data.songs.length
    }
  } catch (error) {
    console.error('加载全部歌曲失败:', error)
  }
}
</script>

<style scoped>
.home-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

.hero-section {
  position: relative;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 50%, rgba(240, 147, 251, 0.1) 100%);
  border-radius: 40px;
  padding: 80px 50px;
  margin-bottom: 50px;
  overflow: hidden;
  border: 1px solid rgba(102, 126, 234, 0.15);
}

.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.3) 50%, transparent 100%);
  border-radius: 50%;
  animation: particleFloat linear infinite;
}

@keyframes particleFloat {
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
    transform: translateY(80vh) scale(1);
  }
  90% {
    opacity: 1;
    transform: translateY(10vh) scale(1);
  }
  100% {
    transform: translateY(-10vh) scale(0);
    opacity: 0;
  }
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 60px;
  position: relative;
  z-index: 2;
}

.hero-text {
  flex: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(102, 126, 234, 0.15);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 20px;
  padding: 8px 16px;
  margin-bottom: 20px;
  font-size: 13px;
  color: rgba(102, 126, 234, 0.9);
}

.badge-icon {
  font-size: 16px;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.hero-title {
  font-size: 56px;
  font-weight: 900;
  margin: 0 0 15px 0;
  line-height: 1.2;
}

.title-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 300% auto;
  animation: gradientAnimation 4s ease infinite;
}

@keyframes gradientAnimation {
  0%, 100% { background-position: 0% center; }
  50% { background-position: 100% center; }
}

.hero-subtitle {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 35px 0;
  font-weight: 400;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 40px;
  margin-bottom: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 42px;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 5px;
}

.stat-divider {
  width: 1px;
  height: 50px;
  background: linear-gradient(180deg, transparent, rgba(102, 126, 234, 0.5), transparent);
}

.hero-actions {
  display: flex;
  gap: 15px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 15px 30px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}

.action-btn.primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.action-btn.primary:hover::before {
  left: 100%;
}

.action-btn.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 50px rgba(102, 126, 234, 0.5);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.hero-visual {
  flex: 0 0 350px;
  position: relative;
}

.album-cover-wrapper {
  position: relative;
  width: 320px;
  height: 320px;
  margin: 0 auto;
}

.album-cover {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(102, 126, 234, 0.4);
  animation: albumFloat 8s ease-in-out infinite;
}

@keyframes albumFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  animation: shineMove 3s ease-in-out infinite;
}

@keyframes shineMove {
  0% { transform: translateX(-100%) rotate(45deg); }
  50%, 100% { transform: translateX(100%) rotate(45deg); }
}

.album-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px solid rgba(102, 126, 234, 0.3);
}

.ring-1 {
  width: 120%;
  height: 120%;
  animation: ringPulse 4s ease-in-out infinite;
}

.ring-2 {
  width: 140%;
  height: 140%;
  animation: ringPulse 4s ease-in-out infinite 1s;
}

.ring-3 {
  width: 160%;
  height: 160%;
  animation: ringPulse 4s ease-in-out infinite 2s;
}

@keyframes ringPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.05);
    opacity: 0.2;
  }
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-note {
  position: absolute;
  font-size: 24px;
  animation: noteFloat 6s ease-in-out infinite;
}

.note-1 {
  top: 20%;
  right: -20px;
  animation-delay: 0s;
}

.note-2 {
  top: 60%;
  left: -30px;
  animation-delay: 2s;
}

.note-3 {
  bottom: 30%;
  right: 10%;
  animation-delay: 4s;
}

@keyframes noteFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-30px) rotate(15deg);
    opacity: 1;
  }
}

.hero-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%231a1a2e' fill-opacity='1' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,229.3C1248,224,1344,160,1392,128L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E");
  background-size: cover;
  background-position: bottom;
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
  align-items: baseline;
  gap: 15px;
}

.section-title {
  font-size: 30px;
  font-weight: 800;
  margin: 0;
}

.section-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.header-decoration {
  width: 120px;
  height: 3px;
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.5), transparent);
  border-radius: 2px;
}

.hot-section {
  margin-bottom: 50px;
}

.song-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 25px;
}

.song-item {
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>