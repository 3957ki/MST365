<template>
  <div class="min-h-screen flex flex-col justify-center items-center">
    <div class="max-w-md w-full bg-blue-50 p-10 rounded-lg shadow-md">
      <div class="mb-6 flex justify-center items-center">
        <router-link to="/">
          <img
            src="/microsoft.png"
            alt="Microsoft Logo"
            width="50"
            height="50"
            class="mr-3 cursor-pointer"
          />
        </router-link>
        <h1 class="text-center text-2xl font-bold text-black">로그인</h1>
      </div>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label
            for="username"
            class="block mb-1 text-sm font-medium text-gray-700"
          >
            아이디
          </label>
          <input
            type="text"
            id="username"
            name="username"
            v-model="userName"
            class="w-full p-2 border border-gray-300 rounded box-border text-black"
            required
            :disabled="isLoading"
          />
        </div>
        <div class="mb-5">
          <label
            for="password"
            class="block mb-1 text-sm font-medium text-gray-700"
          >
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            name="password"
            v-model="password"
            class="w-full p-2 border border-gray-300 rounded box-border text-black"
            required
            :disabled="isLoading"
          />
        </div>
        <p v-if="error" class="text-red-500 text-sm mb-3 text-center">{{ error }}</p>
        <button
          type="submit"
          :disabled="isLoading"
          :class="[
            'w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors',
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          ]"
        >
          {{ isLoading ? "로그인 중..." : "로그인" }}
        </button>
      </form>
      <div class="flex justify-center mt-4 text-sm">
        <div>
          <router-link to="/signup" class="text-blue-600 hover:underline">
            회원가입
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/services/api/auth.js'; // Updated import path


const userName = ref('');
const password = ref('');
const error = ref(null);
const isLoading = ref(false);
const router = useRouter();

const handleSubmit = async () => {
  error.value = null;

  if (!userName.value || !password.value) {
    error.value = "아이디와 비밀번호를 모두 입력해주세요.";
    return;
  }

  isLoading.value = true;

  try {
    const loginData = await login(userName.value, password.value);

    localStorage.setItem("authToken", loginData.accessToken);
    localStorage.setItem("userId", loginData.user.id.toString());

    console.log("로그인 성공, 토큰 저장됨:", loginData.accessToken);
    console.log("사용자 ID 저장됨:", loginData.user.id);

    router.push("/board");

  } catch (err) {
    console.error("로그인 실패:", err);
    error.value = err.message || "로그인 중 오류가 발생했습니다.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Component-specific styles can go here if needed */
</style>
