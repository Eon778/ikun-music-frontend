<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">
          <span class="title-icon">🎵</span>
          {{ isLogin ? '登录' : '注册' }}
        </h2>
        <button class="close-btn" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <form class="modal-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>用户名</label>
          <input 
            type="text" 
            v-model="form.username" 
            placeholder="请输入用户名" 
            required
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>密码</label>
          <input 
            type="password" 
            v-model="form.password" 
            placeholder="请输入密码" 
            required
            class="form-input"
          />
        </div>
        
        <div class="form-group" v-if="!isLogin">
          <label>昵称</label>
          <input 
            type="text" 
            v-model="form.nickname" 
            placeholder="请输入昵称" 
            required
            class="form-input"
          />
        </div>
        
        <button type="submit" class="submit-btn">
          {{ isLogin ? '登录' : '注册' }}
        </button>
        
        <div class="form-footer">
          <span>{{ isLogin ? '还没有账号？' : '已有账号？' }}</span>
          <button type="button" class="toggle-btn" @click="toggleMode">
            {{ isLogin ? '立即注册' : '立即登录' }}
          </button>
        </div>
        
        <div class="demo-info">
          <p>演示账号：</p>
          <p>admin / admin123</p>
          <p>ikunfan / ikun123</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject } from 'vue'
import { useRouter } from 'vue-router'
import { login, register } from '@/api/user'
import { useUserStore } from '@/stores/user'

const emit = defineEmits(['close'])
const router = useRouter()
const userStore = useUserStore()
const toast = inject('toast')

const isLogin = ref(true)
const form = reactive({
  username: '',
  password: '',
  nickname: ''
})

function toggleMode() {
  isLogin.value = !isLogin.value
  form.username = ''
  form.password = ''
  form.nickname = ''
}

async function handleSubmit() {
  try {
    let res
    if (isLogin.value) {
      res = await login({
        username: form.username,
        password: form.password
      })
    } else {
      res = await register({
        username: form.username,
        password: form.password,
        nickname: form.nickname
      })
    }
    
    if (res.code === 200) {
      userStore.setToken(res.data.token)
      userStore.setUser(res.data.user)
      userStore.setUserId(res.data.user.id)
      toast.value = { show: true, message: res.message || '操作成功' }
      setTimeout(() => toast.value.show = false, 2000)
      emit('close')
      router.push('/')
    } else {
      toast.value = { show: true, message: res.message }
      setTimeout(() => toast.value.show = false, 2000)
    }
  } catch (error) {
    toast.value = { show: true, message: '网络错误，请重试' }
    setTimeout(() => toast.value.show = false, 2000)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
  max-width: 420px;
  padding: 40px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  font-size: 28px;
}

.close-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 5px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.form-input {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 16px;
  color: #fff;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: rgba(102, 126, 234, 0.5);
  background: rgba(255, 255, 255, 0.1);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.submit-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  padding: 14px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.toggle-btn {
  background: transparent;
  border: none;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  color: #764ba2;
  text-decoration: underline;
}

.demo-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
}

.demo-info p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: 5px 0;
}

.demo-info p:first-child {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}
</style>