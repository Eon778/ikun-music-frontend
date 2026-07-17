<template>
  <div class="lyrics-view">
    <div class="lyrics-bg-blur" :style="bgBlurStyle"></div>
    <div class="lyrics-bg-overlay"></div>
    <div class="lyrics-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
    </div>

    <div class="lyrics-content">
      <div class="player-left-section">
        <div class="vinyl-container">
          <div class="vinyl-record" :class="{ spinning: playerStore.isPlaying }">
            <div class="vinyl-center">
              <img :src="playerStore.currentSong?.coverUrl" alt="封面" class="vinyl-cover" />
            </div>
            <div class="vinyl-grooves"></div>
          </div>
          <div class="tonearm">
            <div class="tonearm-arm"></div>
            <div class="tonearm-head"></div>
          </div>
        </div>
      </div>

      <div class="player-right-section">
        <div class="song-header">
          <h2 class="song-title">{{ playerStore.currentSong?.name }}</h2>
          <p class="song-artist">{{ playerStore.currentSong?.artist }}</p>
          <p class="copyright">(未经许可,不得翻唱或使用)</p>
        </div>

        <div class="lyrics-container" ref="lyricsContainer" @wheel="handleWheel">
          <div class="lyrics-scroll-track" ref="scrollTrack" @click="handleTrackClick">
            <div class="lyrics-scroll-thumb" :style="{ height: scrollThumbHeight + '%', top: scrollThumbTop + '%' }"></div>
          </div>
          <div class="lyrics-inner" :class="{ 'manual-scrolling': isManualScrolling }" :style="{ transform: `translateY(${lyricsTranslateY}px)` }">
            <div 
              v-for="(line, index) in parsedLyrics" 
              :key="index"
              class="lyric-line"
              :class="{ active: index === currentLyricIndex }"
              @click="seekToLine(index)"
            >
              <span>{{ line.text }}</span>
            </div>
          </div>
          <div v-if="parsedLyrics.length === 0" class="no-lyrics">
            <p>暂无歌词</p>
            <p class="hint">点击播放歌曲后自动获取</p>
          </div>
        </div>
      </div>
    </div>

    <div class="lyrics-footer">
      <div class="footer-left">
        <span class="footer-song">{{ playerStore.currentSong?.name }} - {{ playerStore.currentSong?.artist }}</span>
      </div>
      <div class="footer-controls">
        <button class="footer-btn" @click="handlePrev" :disabled="!playerStore.hasPrev">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="19 20 9 12 19 4 19 20"></polygon>
            <polygon points="5 20 15 12 5 4 5 20"></polygon>
          </svg>
        </button>
        <button class="footer-play-btn" @click="handleToggle" :disabled="playerStore.isLoading">
          <svg v-if="!playerStore.isPlaying" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        </button>
        <button class="footer-btn" @click="handleNext" :disabled="!playerStore.hasNext">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 4 15 12 5 20 5 4"></polygon>
            <polygon points="19 4 9 12 19 20 19 4"></polygon>
          </svg>
        </button>
        <div class="volume-control-footer">
          <button class="footer-btn" @click="toggleMute">
            <svg v-if="!isMuted && playerStore.volume > 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
            class="volume-slider-footer"
          />
        </div>
      </div>
      <div class="footer-right">
        <button class="footer-btn" @click="showPlaylist = !showPlaylist">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <div class="progress-bar-container">
      <span class="progress-time">{{ formatTime(playerStore.currentTime) }}</span>
      <div class="progress-bar" 
           @click="handleProgressClick"
           @mousedown="handleProgressDragStart"
      >
        <div class="progress-fill" :style="{ width: playerStore.progress + '%' }"></div>
      </div>
      <span class="progress-time">{{ formatTime(playerStore.duration) }}</span>
    </div>

    <div v-if="showPlaylist" class="playlist-overlay" @click="showPlaylist = false">
      <div class="playlist-panel" @click.stop>
        <div class="playlist-header">
          <h3 class="playlist-title">播放列表</h3>
          <span class="playlist-count">{{ playlistSongs.length }} 首</span>
          <button class="playlist-close" @click="showPlaylist = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="playlist-content">
          <div 
            v-for="(song, index) in playlistSongs" 
            :key="song.id" 
            class="playlist-item"
            :class="{ active: playerStore.currentSong?.id === song.id }"
            @click="handlePlaylistPlay(song)"
          >
            <div class="playlist-index">
              <span v-if="playerStore.currentSong?.id === song.id && playerStore.isPlaying" class="playing-icon">♪</span>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="playlist-info">
              <p class="playlist-name">{{ song.name }}</p>
              <p class="playlist-artist">{{ song.artist }}</p>
            </div>
            <button class="playlist-remove" @click.stop="removeFromPlaylist(index)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div v-if="playlistSongs.length === 0" class="playlist-empty">
            暂无歌曲
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '@/stores/player';
import { getMyhkSongLyric } from '@/api/myhk';
const router = useRouter();
const playerStore = usePlayerStore();
const lyricsContainer = ref(null);
const scrollTrack = ref(null);
const currentLyricIndex = ref(-1);
const rawLyrics = ref('');
const isAutoScrolling = ref(true);
const isManualScrolling = ref(false);
const lyricsTranslateY = ref(0);
const scrollTimeoutId = ref(null);
const manualScrollOffset = ref(0);
const isMuted = ref(false);
const showPlaylist = ref(false);
const isDragging = ref(false);
const playlistSongs = computed(() => {
  if (playerStore.playSource && playerStore.playSourceList.length > 0) {
    return playerStore.playSourceList;
  }
  return playerStore.playlist;
});
const backgroundStyle = computed(() => {
  return {
    background: currentGradient.value
  };
});
const bgBlurStyle = computed(() => {
  const coverUrl = playerStore.currentSong?.coverUrl;
  if (!coverUrl) {
    return {
      background: 'linear-gradient(135deg, #fff0f5 0%, #e6e6fa 50%, #f0f8ff 100%)'
    };
  }
  return {
    backgroundImage: `url(${coverUrl})`
  };
});
const currentGradient = ref('linear-gradient(135deg, #fff0f5 0%, #e6e6fa 50%, #f0f8ff 100%)');
const parsedLyrics = computed(() => {
  if (!rawLyrics.value)
    return [];
  const lines = rawLyrics.value.split('\n');
  const result = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
  lines.forEach(line => {
    const matches = [...line.matchAll(timeRegex)];
    if (matches.length > 0) {
      const timeParts = matches[0];
      const minutes = parseInt(timeParts[1]);
      const seconds = parseInt(timeParts[2]);
      const milliseconds = parseInt(timeParts[3].padEnd(3, '0'));
      const time = minutes * 60 + seconds + milliseconds / 1000;
      const text = line.replace(timeRegex, '').trim();
      if (text) {
        result.push({ time, text });
      }
    }
  });
  result.sort((a, b) => a.time - b.time);
  return result;
});
const scrollThumbHeight = computed(() => {
  const inner = lyricsContainer.value?.querySelector('.lyrics-inner');
  if (!lyricsContainer.value || !inner || !parsedLyrics.value.length)
    return 20;
  const containerHeight = lyricsContainer.value.clientHeight;
  const innerHeight = inner.offsetHeight;
  return Math.max(20, Math.min(80, (containerHeight / innerHeight) * 100));
});
const scrollThumbTop = computed(() => {
  const inner = lyricsContainer.value?.querySelector('.lyrics-inner');
  if (!lyricsContainer.value || !inner || !parsedLyrics.value.length)
    return 0;
  const containerHeight = lyricsContainer.value.clientHeight;
  const innerHeight = inner.offsetHeight;
  const maxScroll = innerHeight - containerHeight;
  if (maxScroll <= 0)
    return 0;
  return ((-lyricsTranslateY.value) / maxScroll) * (100 - scrollThumbHeight.value);
});
async function fetchLyrics() {
 if (!playerStore.currentSong?.id)
 return;
 try {
 const res = await getMyhkSongLyric(playerStore.currentSong.id);
 if (res && res.code === 1 && res.data) {
 if (typeof res.data === 'object') {
 rawLyrics.value = res.data.lrc || res.data.lyric || '';
 }
 else {
 rawLyrics.value = res.data;
 }
 }
 }
 catch (e) {
 console.warn('获取歌词失败:', e);
 }
}
function extractColorsFromCover() {
 if (!playerStore.currentSong?.coverUrl) {
 currentGradient.value = 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
 return;
 }
 const colors = getColorPalette(playerStore.currentSong.coverUrl);
 currentGradient.value = `linear-gradient(180deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`;
}
function getColorPalette(imageUrl) {
 const colorMap = {
 'e91e63': ['#ffe4e6', '#fff0f3', '#fff5f7'],
 'ff5722': ['#fff3e0', '#fff8f0', '#fffcf5'],
 'ff9800': ['#fff8e1', '#fffdf5', '#fffef9'],
 'ffc107': ['#fffde7', '#fffef5', '#fffff9'],
 '4caf50': ['#e8f5e9', '#f1f8f2', '#f7fcf8'],
 '2196f3': ['#e3f2fd', '#f0f7ff', '#f5faff'],
 '3f51b5': ['#e8eaf6', '#f3f5fc', '#f8f9fe'],
 '9c27b0': ['#fce4ec', '#faf0f5', '#fdf5f9'],
 '009688': ['#e0f2f1', '#f0faf9', '#f5fdfc'],
 '607d8b': ['#eceff1', '#f5f6f7', '#fafafa'],
 };
 for (const [key, value] of Object.entries(colorMap)) {
 if (imageUrl.includes(key)) {
 return value;
 }
 }
 const hash = imageUrl.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
 const keys = Object.keys(colorMap);
 const index = hash % keys.length;
 return colorMap[keys[index]];
}
function goBack() {
 router.back();
}
function handleToggle() {
 playerStore.toggle();
}
function handlePrev() {
 playerStore.prev();
}
function handleNext() {
 playerStore.next();
}
function handleVolumeChange(e) {
  const volume = parseInt(e.target.value);
  playerStore.volume = volume;
  isMuted.value = volume === 0;
  const audio = getAudioElement();
  if (audio) {
    audio.volume = volume / 100;
    audio.muted = false;
  }
}
function toggleMute() {
  const audio = getAudioElement();
  if (audio) {
    audio.muted = !audio.muted;
    isMuted.value = audio.muted;
    if (!audio.muted) {
      audio.volume = playerStore.volume / 100;
    }
  }
}
function handlePlaylistPlay(song) {
  playerStore.play(song, playerStore.playSource, playerStore.playSourceList);
}
function removeFromPlaylist(index) {
  if (playerStore.playSource && playerStore.playSourceList.length > 0) {
    playerStore.playSourceList.splice(index, 1);
  } else {
    playerStore.playlist.splice(index, 1);
    if (index < playerStore.currentIndex) {
      playerStore.currentIndex--;
    } else if (index === playerStore.currentIndex) {
      if (playerStore.playlist.length > 0) {
        playerStore.currentIndex = Math.min(index, playerStore.playlist.length - 1);
      } else {
        playerStore.currentIndex = -1;
        playerStore.currentSong = null;
      }
    }
  }
}
function seekToLine(index) {
  const audio = getAudioElement();
  if (parsedLyrics.value[index]?.time && audio) {
    audio.currentTime = parsedLyrics.value[index].time;
    currentLyricIndex.value = index;
    setTimeout(() => {
      scrollToCurrentLine();
    }, 100);
  }
}
function handleProgressClick(e) {
 if (isDragging.value) return;
 const rect = e.currentTarget.getBoundingClientRect();
 const percent = (e.clientX - rect.left) / rect.width;
 setProgress(percent);
}

function handleProgressDragStart(e) {
 if (e.button !== 0) return;
 e.preventDefault();
 isDragging.value = true;
 
 const bar = e.currentTarget;
 const rect = bar.getBoundingClientRect();
 const percent = (e.clientX - rect.left) / rect.width;
 setProgress(percent);
 
 const handleMove = (e) => {
   if (!isDragging.value) return;
   const rect = bar.getBoundingClientRect();
   const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
   setProgress(percent);
 };
 
 const handleUp = () => {
   isDragging.value = false;
   document.removeEventListener('mousemove', handleMove);
   document.removeEventListener('mouseup', handleUp);
 };
 
 document.addEventListener('mousemove', handleMove);
 document.addEventListener('mouseup', handleUp);
}

function setProgress(percent) {
 playerStore.progress = percent * 100;
 const audio = getAudioElement();
 if (audio && playerStore.duration > 0) {
   audio.currentTime = percent * playerStore.duration;
 }
}
function handleWheel(e) {
  e.preventDefault();
  isAutoScrolling.value = false;
  isManualScrolling.value = true;
  if (scrollTimeoutId.value) {
    clearTimeout(scrollTimeoutId.value);
  }
  const inner = lyricsContainer.value?.querySelector('.lyrics-inner');
  if (!inner)
    return;
  const containerHeight = lyricsContainer.value.clientHeight;
  const innerHeight = inner.offsetHeight;
  const maxTranslateY = -(innerHeight - containerHeight);
  const delta = e.deltaY;
  const newOffset = manualScrollOffset.value + delta;
  manualScrollOffset.value = Math.max(maxTranslateY, Math.min(0, newOffset));
  lyricsTranslateY.value = manualScrollOffset.value;
  scrollTimeoutId.value = setTimeout(() => {
    isAutoScrolling.value = true;
    isManualScrolling.value = false;
    scrollToCurrentLine();
  }, 2000);
}
function handleTrackClick(e) {
  const track = scrollTrack.value;
  if (!track)
    return;
  const rect = track.getBoundingClientRect();
  const percent = (e.clientY - rect.top) / rect.height;
  const inner = lyricsContainer.value?.querySelector('.lyrics-inner');
  if (!inner)
    return;
  const containerHeight = lyricsContainer.value.clientHeight;
  const innerHeight = inner.offsetHeight;
  const maxScroll = innerHeight - containerHeight;
  if (maxScroll <= 0)
    return;
  isAutoScrolling.value = false;
  manualScrollOffset.value = -(percent * maxScroll);
  lyricsTranslateY.value = manualScrollOffset.value;
  if (scrollTimeoutId.value) {
    clearTimeout(scrollTimeoutId.value);
  }
  scrollTimeoutId.value = setTimeout(() => {
    isAutoScrolling.value = true;
    scrollToCurrentLine();
  }, 2000);
}
function scrollToCurrentLine() {
  if (!isAutoScrolling.value || !lyricsContainer.value || currentLyricIndex.value < 0)
    return;
  const inner = lyricsContainer.value.querySelector('.lyrics-inner');
  if (!inner)
    return;
  const currentLine = inner.children[currentLyricIndex.value];
  if (!currentLine)
    return;
  const container = lyricsContainer.value;
  const containerHeight = container.clientHeight;
  const lineHeight = currentLine.offsetHeight;
  const lineTop = currentLine.offsetTop;
  const targetTranslateY = -(lineTop - (containerHeight - lineHeight) / 2);
  const innerHeight = inner.offsetHeight;
  const maxTranslateY = -(innerHeight - containerHeight);
  const finalTranslateY = Math.max(maxTranslateY, Math.min(0, targetTranslateY));
  lyricsTranslateY.value = finalTranslateY;
  manualScrollOffset.value = finalTranslateY;
}
function formatTime(time) {
 if (isNaN(time) || time <= 0)
 return '00:00';
 const minutes = Math.floor(time / 60);
 const seconds = Math.floor(time % 60);
 return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
watch(() => playerStore.currentSong, async () => {
 currentLyricIndex.value = -1;
 rawLyrics.value = '';
 extractColorsFromCover();
 await fetchLyrics();
});

function getAudioElement() {
  return playerStore.audioRef || document.querySelector('audio');
}

watch(() => playerStore.currentTime, (currentTime) => {
  if (parsedLyrics.value.length > 0) {
    for (let i = parsedLyrics.value.length - 1; i >= 0; i--) {
      if (currentTime >= parsedLyrics.value[i].time) {
        if (currentLyricIndex.value !== i) {
          currentLyricIndex.value = i;
          scrollToCurrentLine();
        }
        break;
      }
    }
  }
});

onMounted(() => {
  extractColorsFromCover();
  fetchLyrics();
});

onUnmounted(() => {
  if (scrollTimeoutId.value) {
    clearTimeout(scrollTimeoutId.value);
  }
});
</script>

<style scoped>
.lyrics-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 100px;
  position: relative;
  overflow: hidden;
}

.lyrics-bg-blur {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  filter: blur(80px) brightness(1.2);
  transform: scale(1.1);
  z-index: 0;
  opacity: 0.7;
}

.lyrics-bg-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,240,245,0.3) 0%, rgba(230,230,250,0.3) 50%, rgba(240,248,255,0.3) 100%);
  z-index: 0;
}

.lyrics-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 30px;
  position: relative;
  z-index: 1;
}

.back-btn {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: none;
  color: #333;
  cursor: pointer;
  padding: 12px;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.05);
}

.back-btn svg {
  width: 24px;
  height: 24px;
}

.lyrics-content {
  flex: 1;
  display: flex;
  padding: 40px 60px;
  gap: 80px;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.player-left-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.vinyl-container {
  position: relative;
  width: 280px;
  height: 280px;
}

.turntable-base {
  position: absolute;
  bottom: -15px;
  left: -15px;
  right: -15px;
  height: 35px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.vinyl-record {
  position: absolute;
  top: 15px;
  left: 15px;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.2) 100%);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.vinyl-record.spinning {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.vinyl-grooves {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: 
    radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.05) 30.5%, transparent 31%),
    radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.05) 40.5%, transparent 41%),
    radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.05) 50.5%, transparent 51%),
    radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.05) 60.5%, transparent 61%),
    radial-gradient(circle at center, transparent 70%, rgba(0,0,0,0.05) 70.5%, transparent 71%),
    radial-gradient(circle at center, transparent 80%, rgba(0,0,0,0.05) 80.5%, transparent 81%),
    radial-gradient(circle at center, transparent 90%, rgba(0,0,0,0.05) 90.5%, transparent 91%);
}

.vinyl-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255,255,255,0.5);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.vinyl-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tonearm {
  position: absolute;
  top: 0;
  right: 15px;
  width: 90px;
  height: 180px;
  transform-origin: top right;
  transform: rotate(-30deg);
  transition: transform 0.5s ease;
}

.tonearm-arm {
  position: absolute;
  top: 0;
  right: 20px;
  width: 5px;
  height: 160px;
  background: linear-gradient(180deg, rgba(139,115,85,0.6) 0%, rgba(107,83,68,0.4) 100%);
  border-radius: 3px;
}

.tonearm-head {
  position: absolute;
  bottom: 10px;
  right: 8px;
  width: 25px;
  height: 18px;
  background: linear-gradient(180deg, rgba(74,74,74,0.6) 0%, rgba(42,42,42,0.4) 100%);
  border-radius: 4px;
}

.player-right-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.song-header {
  margin-bottom: 40px;
}

.song-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.song-artist {
  font-size: 16px;
  color: #666;
  margin: 0 0 8px 0;
}

.copyright {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.lyrics-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 400px;
  position: relative;
}

.lyrics-scroll-track {
  position: absolute;
  right: 8px;
  top: 20px;
  bottom: 20px;
  width: 4px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 2px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
}

.lyrics-container:hover .lyrics-scroll-track {
  opacity: 1;
}

.lyrics-scroll-thumb {
  position: absolute;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  cursor: grab;
}

.lyrics-scroll-thumb:active {
  cursor: grabbing;
}

.lyrics-inner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.lyrics-inner.manual-scrolling {
  transition: none;
}

.lyric-line {
  padding: 10px 20px;
  text-align: center;
  font-size: 15px;
  color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 20px;
}

.lyric-line:hover {
  color: rgba(0, 0, 0, 0.7);
  background: rgba(0, 0, 0, 0.03);
}

.lyric-line.active {
  color: #e91e63;
  font-size: 18px;
  font-weight: 500;
  background: rgba(233, 30, 99, 0.08);
}

.no-lyrics {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #999;
}

.no-lyrics p {
  margin: 8px 0;
}

.no-lyrics .hint {
  font-size: 12px;
  color: #ccc;
}

.lyrics-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(30px);
  border-top: 1px solid rgba(255, 255, 255, 0.4);
  padding: 12px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
}

.footer-left {
  flex: 1;
}

.footer-song {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.footer-controls {
  display: flex;
  align-items: center;
  gap: 18px;
}

.volume-control-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-slider-footer {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.volume-slider-footer::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.volume-slider-footer::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.volume-slider-footer::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.footer-btn {
  background: transparent;
  border: none;
  color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.footer-btn:hover {
  color: rgba(0, 0, 0, 0.7);
  background: rgba(0, 0, 0, 0.04);
}

.footer-btn:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

.footer-btn svg {
  width: 18px;
  height: 18px;
}

.footer-play-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e91e63, #c2185b);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 3px 12px rgba(233, 30, 99, 0.3);
}

.footer-play-btn:hover:not(:disabled) {
  transform: scale(1.08);
  box-shadow: 0 4px 16px rgba(233, 30, 99, 0.4);
}

.footer-play-btn:disabled {
  opacity: 0.6;
}

.footer-play-btn svg {
  width: 18px;
  height: 18px;
  color: #fff;
}

.footer-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.progress-bar-container {
  position: fixed;
  bottom: 75px;
  left: 0;
  right: 0;
  padding: 0 30px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.progress-time {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
  min-width: 45px;
}

.progress-bar {
  flex: 1;
  height: 3px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #e91e63, #c2185b);
  border-radius: 2px;
  transition: width 0.15s ease;
}

.playlist-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.playlist-panel {
  width: 400px;
  max-height: 60vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px 20px 0 0;
  margin-right: 30px;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.playlist-header {
  display: flex;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  gap: 12px;
}

.playlist-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.playlist-count {
  font-size: 13px;
  color: #999;
}

.playlist-close {
  margin-left: auto;
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.playlist-close:hover {
  color: #666;
  background: rgba(0, 0, 0, 0.05);
}

.playlist-close svg {
  width: 18px;
  height: 18px;
}

.playlist-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.playlist-item {
  display: flex;
  align-items: center;
  padding: 12px 25px;
  cursor: pointer;
  transition: background 0.2s ease;
  gap: 15px;
}

.playlist-item:hover {
  background: rgba(0, 0, 0, 0.03);
}

.playlist-item.active {
  background: rgba(233, 30, 99, 0.08);
}

.playlist-index {
  width: 24px;
  text-align: center;
  font-size: 14px;
  color: #bbb;
  flex-shrink: 0;
}

.playlist-item.active .playlist-index {
  color: #e91e63;
}

.playing-icon {
  font-size: 14px;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.playlist-info {
  flex: 1;
  min-width: 0;
}

.playlist-name {
  font-size: 14px;
  color: #333;
  margin: 0 0 3px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-item.active .playlist-name {
  color: #e91e63;
  font-weight: 500;
}

.playlist-artist {
  font-size: 12px;
  color: #999;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-remove {
  background: transparent;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.playlist-remove:hover {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

.playlist-remove svg {
  width: 14px;
  height: 14px;
}

.playlist-empty {
  text-align: center;
  color: #bbb;
  font-size: 14px;
  padding: 60px 20px;
}
</style>