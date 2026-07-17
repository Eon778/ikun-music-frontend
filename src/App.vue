<template>
  <div class="app-container">
    <audio 
      ref="globalAudioRef" 
      :src="playerStore.currentSong?.audioUrl"
      @timeupdate="handleTimeUpdate"
      @ended="handleEnded"
      @loadedmetadata="handleLoaded"
      @playing="handlePlaying"
      @pause="handlePause"
      @error="handleError"
      @canplay="handleCanPlay"
    >
      <source :src="playerStore.currentSong?.audioUrl" type="audio/mpeg">
    </audio>
    <NavBar v-if="!isLyricsPage" />
    <main class="main-content" :class="{ 'lyrics-content-full': isLyricsPage }">
      <router-view />
    </main>
    <PlayerBar v-if="!isLyricsPage" :globalAudio="globalAudioRef" />
    <LoginModal v-if="showLoginModal" @close="showLoginModal = false" />
    <div class="toast" v-if="toast.show">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, provide, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import PlayerBar from '@/components/PlayerBar.vue'
import LoginModal from '@/components/LoginModal.vue'
import { useUserStore } from '@/stores/user'
import { usePlayerStore } from '@/stores/player'

const route = useRoute()
const userStore = useUserStore()
const playerStore = usePlayerStore()
const showLoginModal = ref(false)
const toast = ref({ show: false, message: '' })
const globalAudioRef = ref(null)

const isLyricsPage = computed(() => {
  return route.path === '/lyrics'
})

provide('showLoginModal', showLoginModal)
provide('toast', toast)

onMounted(() => {
  userStore.initUser()
  if (globalAudioRef.value) {
    playerStore.setAudioRef(globalAudioRef.value)
  }
})

watch(() => playerStore.isPlaying, (isPlaying) => {
  if (globalAudioRef.value) {
    if (isPlaying && globalAudioRef.value.readyState >= 2) {
      globalAudioRef.value.play().catch(e => {
        console.error('自动播放失败:', e)
      })
    } else if (!isPlaying) {
      globalAudioRef.value.pause()
    }
  }
})

watch(() => playerStore.currentSong, () => {
  if (globalAudioRef.value && playerStore.currentSong) {
    nextTick(() => {
      globalAudioRef.value.load()
      console.log('开始加载音频:', playerStore.currentSong?.audioUrl)
    })
    playerStore.setCurrentTime(0)
    playerStore.setDuration(0)
    playerStore.progress = 0
  }
})

function handleTimeUpdate() {
  if (globalAudioRef.value) {
    const curTime = globalAudioRef.value.currentTime
    const dur = globalAudioRef.value.duration || 0
    playerStore.setCurrentTime(curTime)
    playerStore.setDuration(dur)
    playerStore.progress = dur > 0 ? (curTime / dur) * 100 : 0
  }
}

function handleLoaded() {
  if (globalAudioRef.value) {
    const dur = globalAudioRef.value.duration || 0
    playerStore.setDuration(dur)
    console.log('音频元数据加载完成:', dur, '秒')
  }
}

function handleCanPlay() {
  console.log('音频可以播放:', playerStore.currentSong?.name)
  if (playerStore.isPlaying && globalAudioRef.value) {
    globalAudioRef.value.play().catch(e => {
      console.error('canplay后播放失败:', e)
    })
  }
}

function handleError(e) {
  const audio = e.target
  let err = '未知错误'
  switch(audio.error?.code) {
    case 1: err = 'MEDIA_ERR_ABORTED - 资源被中止'; break
    case 2: err = 'MEDIA_ERR_NETWORK - 网络错误'; break
    case 3: err = 'MEDIA_ERR_DECODE - 解码错误'; break
    case 4: err = 'MEDIA_ERR_SRC_NOT_SUPPORTED - 资源格式不支持'; break
  }
  console.error('音频错误:', err, 'URL:', playerStore.currentSong?.audioUrl, audio.error)
}

function handleEnded() {
  if (playerStore.hasNext) {
    playerStore.next()
  } else {
    playerStore.pause()
    playerStore.progress = 0
    currentTime.value = 0
  }
}

function handlePlaying() {
  playerStore.isPlaying = true
}

function handlePause() {
  playerStore.isPlaying = false
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 70px;
  padding-bottom: 80px;
}

.main-content.lyrics-content-full {
  padding-top: 0;
  padding-bottom: 0;
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  padding: 12px 24px;
  border-radius: 25px;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
  animation: slideIn 0.3s ease;
  z-index: 1000;
}

@keyframes slideIn {
  from {
    transform: translateX(100px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>