<template>
  <nav class="navbar" :class="{ scrolled: isScrolled }">
    <div class="navbar-content">
      <div class="navbar-left">
        <router-link to="/" class="logo">
          <div class="logo-icon-wrapper">
            <img src="/favicon.jpg" alt="Logo" class="logo-icon" />
            <div class="logo-glow"></div>
          </div>
          <span class="logo-text">IKUN音乐</span>
        </router-link>
      </div>
      
      <div class="navbar-center">
        <div class="search-box" @click="goToSearch">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input 
            type="text" 
            class="search-input" 
            placeholder="搜索歌曲、歌手..." 
            @keyup.enter="handleSearch"
            v-model="searchKeyword"
          />
          <div class="search-decoration"></div>
        </div>
      </div>
      
      <div class="navbar-right">
        <router-link to="/" class="nav-item" :class="{ active: $route.name === 'Home' }">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>首页</span>
        </router-link>
        <router-link to="/search" class="nav-item" :class="{ active: $route.name === 'Search' }">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <span>搜索</span>
        </router-link>
        <router-link to="/my-music" class="nav-item" :class="{ active: $route.name === 'MyMusic' }">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
          <span>我的音乐</span>
        </router-link>
        
        <div v-if="userStore.isLoggedIn" class="user-info" @click="toggleUserMenu">
          <img :src="userStore.user.avatar" alt="用户头像" class="user-avatar" />
          <span class="user-name">{{ userStore.user.nickname }}</span>
          <svg class="menu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          <div class="user-menu" v-if="showUserMenu">
            <div class="menu-item" @click="handleLogout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>退出登录</span>
            </div>
          </div>
        </div>
        
        <button v-else class="login-btn" @click="openLogin">
          <span>登录</span>
          <svg class="login-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
    <div class="navbar-glow"></div>
  </nav>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const searchKeyword = ref('')
const showUserMenu = ref(false)
const showLoginModal = inject('showLoginModal')
const isScrolled = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function goToSearch() {
  router.push('/search')
}

function handleSearch() {
  if (searchKeyword.value.trim()) {
    router.push(`/search?keyword=${encodeURIComponent(searchKeyword.value)}`)
    searchKeyword.value = ''
  }
}

function openLogin() {
  showLoginModal.value = true
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function handleLogout() {
  userStore.logout()
  showUserMenu.value = false
  router.push('/')
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 75px;
  background: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 100;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar.scrolled {
  background: rgba(26, 26, 46, 0.95);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.navbar-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.navbar-glow {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.5), transparent);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.navbar.scrolled .navbar-glow {
  opacity: 1;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #fff;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.logo-icon-wrapper {
  position: relative;
  width: 42px;
  height: 42px;
  margin-right: 12px;
}

.logo-icon {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.logo:hover .logo-icon {
  box-shadow: 0 6px 30px rgba(102, 126, 234, 0.6);
  transform: rotate(5deg);
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.4) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.logo:hover .logo-glow {
  opacity: 1;
}

.logo-text {
  font-size: 22px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% auto;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% center; }
  50% { background-position: 100% center; }
}

.navbar-center {
  flex: 1;
  max-width: 550px;
  margin: 0 50px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 30px;
  padding: 12px 25px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.search-box:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 0 30px rgba(102, 126, 234, 0.1);
}

.search-box:focus-within {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 0 40px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.search-icon {
  width: 19px;
  height: 19px;
  color: rgba(255, 255, 255, 0.5);
  margin-right: 12px;
  transition: color 0.3s ease;
}

.search-box:focus-within .search-icon {
  color: #667eea;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 15px;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.search-decoration {
  position: absolute;
  top: -1px;
  left: 20%;
  width: 60%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #667eea, transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.search-box:focus-within .search-decoration {
  opacity: 1;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.65);
  padding: 10px 18px;
  border-radius: 25px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.2), transparent);
  transition: left 0.5s ease;
}

.nav-item:hover::before {
  left: 100%;
}

.nav-item:hover,
.nav-item.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.nav-item.active {
  background: rgba(102, 126, 234, 0.15);
}

.nav-icon {
  width: 18px;
  height: 18px;
}

.login-btn {
  position: relative;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  padding: 11px 26px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
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
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
}

.login-icon {
  width: 16px;
  height: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.08);
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(102, 126, 234, 0.5);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.menu-arrow {
  width: 14px;
  height: 14px;
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.3s ease;
}

.user-info:hover .menu-arrow {
  transform: rotate(180deg);
}

.user-menu {
  position: absolute;
  top: 65px;
  right: 30px;
  background: rgba(26, 26, 46, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px;
  min-width: 160px;
  z-index: 200;
  animation: menuFadeIn 0.2s ease;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.menu-item:hover {
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
}

.menu-item svg {
  width: 16px;
  height: 16px;
}
</style>