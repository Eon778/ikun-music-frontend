<template>
  <div class="player-bar" v-if="playerStore.currentSong">
    <div class="player-glow"></div>
    
    <div class="player-content">
      <div class="player-left" @click="handleSongClick">
        <div class="cover-wrapper">
          <img 
            :src="playerStore.currentSong.coverUrl" 
            alt="封面" 
            class="cover-image"
            :class="{ spinning: playerStore.isPlaying }"
          />
          <div class="cover-shadow"></div>
        </div>
        <div class="song-info">
          <h4 class="song-name">{{ playerStore.currentSong.name }}</h4>
          <p class="song-artist">{{ playerStore.currentSong.artist }}</p>
        </div>
      </div>
      
      <div class="player-center">
        <div class="player-controls">
          <button class="control-btn" @click="handlePrev" :disabled="!playerStore.hasPrev">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="19 20 9 12 19 4 19 20"></polygon>
              <polygon points="5 20 15 12 5 4 5 20"></polygon>
            </svg>
          </button>
          <button class="play-btn" @click="handleToggle" :disabled="playerStore.isLoading">
            <div class="play-btn-inner">
              <svg v-if="playerStore.isLoading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-linecap="round">
                  <animate attributeName="stroke-dasharray" values="60 60" />
                  <animate attributeName="stroke-dashoffset" values="0 -60" dur="1s" repeatCount="indefinite" />
                </circle>
              </svg>
              <svg v-else-if="!playerStore.isPlaying" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            </div>
          </button>
          <button class="control-btn" @click="handleNext" :disabled="!playerStore.hasNext">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 4 15 12 5 20 5 4"></polygon>
              <polygon points="19 4 9 12 19 20 19 4"></polygon>
            </svg>
          </button>
        </div>
        
        <div class="progress-container">
          <span class="time">{{ formatTime(playerStore.currentTime) }}</span>
          <div class="progress-bar" 
               @click="handleProgressClick"
               @mousedown="handleProgressDragStart"
          >
            <div class="progress-fill" :style="{ width: playerStore.progress + '%' }">
              <div class="progress-shine"></div>
            </div>
            <div class="progress-thumb" :style="{ left: playerStore.progress + '%' }"></div>
          </div>
          <span class="time">{{ formatTime(playerStore.duration) }}</span>
        </div>
        
        <div class="waveform-container" :class="{ playing: playerStore.isPlaying }">
          <div 
            v-for="i in 20" 
            :key="i" 
            class="wave-bar"
            :style="{ animationDelay: (i * 0.05) + 's' }"
          ></div>
        </div>
      </div>
      
      <div class="player-right">
        <div class="volume-control">
          <button class="volume-icon-btn" @click="toggleMute">
            <svg v-if="!isMuted && playerStore.volume > 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
            <svg v-else-if="isMuted || playerStore.volume === 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          </button>
          <input 
            type="range" 
            min="0" 
            max="100" 
            :value="isMuted ? 0 : playerStore.volume" 
            @input="handleVolumeChange"
            class="volume-slider"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'

const router = useRouter()
const playerStore = usePlayerStore()
const isMuted = ref(false)
const isDragging = ref(false)

const audioEl = computed(() => playerStore.audioRef)

function handleSongClick() {
  router.push('/lyrics')
}

function handleToggle() {
  if (audioEl.value) {
    if (playerStore.isPlaying) {
      audioEl.value.pause()
      playerStore.pause()
    } else {
      audioEl.value.play().then(() => {
        playerStore.isPlaying = true
      }).catch(e => {
        console.error('播放失败:', e)
        playerStore.isPlaying = false
      })
    }
  } else {
    playerStore.toggle()
  }
}

function handlePrev() {
  playerStore.prev()
}

function handleNext() {
  playerStore.next()
}

function handleProgressClick(e) {
  if (isDragging.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  setProgress(percent)
}

function handleProgressDragStart(e) {
  if (e.button !== 0) return
  e.preventDefault()
  isDragging.value = true
  
  const bar = e.currentTarget
  const rect = bar.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  setProgress(percent)
  
  const handleMove = (e) => {
    if (!isDragging.value) return
    const rect = bar.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setProgress(percent)
  }
  
  const handleUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleUp)
  }
  
  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleUp)
}

function setProgress(percent) {
  playerStore.progress = percent * 100
  if (audioEl.value && playerStore.duration > 0) {
    audioEl.value.currentTime = percent * playerStore.duration
  }
}

function handleVolumeChange(e) {
  const volume = parseInt(e.target.value)
  playerStore.volume = volume
  isMuted.value = volume === 0
  if (audioEl.value) {
    audioEl.value.volume = playerStore.volume / 100
    audioEl.value.muted = false
  }
}

function toggleMute() {
  if (audioEl.value) {
    audioEl.value.muted = !audioEl.value.muted
    isMuted.value = audioEl.value.muted
    if (!audioEl.value.muted) {
      audioEl.value.volume = playerStore.volume / 100
    }
  }
}

function formatTime(time) {
  if (isNaN(time) || time <= 0) return '00:00'
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(25px);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 20px 30px;
  z-index: 100;
  overflow: hidden;
}

.player-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.6), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.player-bar:hover .player-glow {
  opacity: 1;
}

.player-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  position: relative;
  z-index: 2;
}

.player-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 0 0 300px;
}

.cover-wrapper {
  position: relative;
  width: 56px;
  height: 56px;
}

.cover-image {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
}

.cover-image.spinning {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.cover-shadow {
  position: absolute;
  top: 4px;
  left: 4px;
  right: -4px;
  bottom: -4px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  z-index: -1;
}

.song-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.song-name {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 25px;
}

.control-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.control-btn:hover:not(:disabled) {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.control-btn svg {
  width: 26px;
  height: 26px;
}

.play-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
  position: relative;
  overflow: hidden;
}

.play-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.play-btn:hover::before {
  left: 100%;
}

.play-btn:hover:not(:disabled) {
  transform: scale(1.15);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.5);
}

.play-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.play-btn-inner {
  position: relative;
  z-index: 2;
}

.play-btn svg {
  width: 22px;
  height: 22px;
  color: #fff;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  max-width: 650px;
}

.time {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  min-width: 50px;
  text-align: center;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  position: relative;
  cursor: pointer;
  transition: height 0.3s ease;
}

.progress-bar:hover {
  height: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px;
  position: relative;
  transition: width 0.1s linear;
}

.progress-shine {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), transparent);
  border-radius: 3px 3px 0 0;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  transition: left 0.1s linear, transform 0.3s ease;
  opacity: 0;
}

.progress-bar:hover .progress-thumb {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.2);
}

.waveform-container {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  opacity: 0.4;
  transition: opacity 0.3s ease;
}

.waveform-container.playing {
  opacity: 1;
}

.wave-bar {
  width: 3px;
  height: 8px;
  background: linear-gradient(180deg, #667eea, #764ba2);
  border-radius: 2px;
  animation: waveBar 0.6s ease-in-out infinite;
}

@keyframes waveBar {
  0%, 100% {
    height: 8px;
  }
  50% {
    height: 20px;
  }
}

.player-right {
  flex: 0 0 200px;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.volume-icon-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.volume-icon-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.volume-icon-btn svg {
  width: 20px;
  height: 20px;
}

.volume-slider {
  flex: 1;
  height: 5px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  outline: none;
  transition: height 0.3s ease;
}

.volume-slider:hover {
  height: 7px;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.volume-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
</style>