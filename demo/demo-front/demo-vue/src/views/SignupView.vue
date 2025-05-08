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
        <h1 class="text-center text-2xl font-bold text-black">회원가입</h1>
      </div>
      <form @submit.prevent="handleSignup">
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
        <div class="mb-4">
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
        <div class="mb-1">
          <label
            for="confirmPassword"
            class="block mb-1 text-sm font-medium text-gray-700"
          >
            비밀번호 확인
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            v-model="confirmPassword"
            :class="[
              'w-full p-2 border rounded box-border text-black',
              passwordError ? 'border-red-500' : 'border-gray-300'
            ]"
            required
            :disabled="isLoading"
          />
          <p v-if="passwordError" class="text-red-500 text-xs mt-1">{{ passwordError }}</p>
        </div>
        <p v-if="apiError" class="text-red-500 text-sm mt-2 text-center">{{ apiError }}</p>
        <button
          type="submit"
          :disabled="isLoading || !!passwordError"
          :class="[
            'w-full mt-4 py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-colors',
            (isLoading || !!passwordError) ? 'opacity-50 cursor-not-allowed' : ''
          ]"
        >
          {{ isLoading ? "가입 처리 중..." : "회원가입" }}
        </button>
      </form>
      <div class="mt-4 text-center text-sm">
        <router-link to="/login" class="text-blue-600 hover:underline">
          로그인
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { signup } from '@/services/api/auth.js'; // Updated import path

const userName = ref('');
const password = ref('');
const confirmPassword = ref('');
const passwordError = ref('');
const apiError = ref(null);
const isLoading = ref(false);
const router = useRouter();

const checkPasswordMatch = () => {
  if (password.value && confirmPassword.value && password.value !== confirmPassword.value) {
    passwordError.value = "비밀번호가 일치하지 않습니다.";
  } else {
    passwordError.value = "";
  }
};

watch(password, checkPasswordMatch);
watch(confirmPassword, checkPasswordMatch);

const handleSignup = async () => {
  apiError.value = null;
  checkPasswordMatch(); // Ensure check before submit

  if (!userName.value || !password.value || !confirmPassword.value) {
    apiError.value = "모든 필드를 입력해주세요.";
    return;
  }
  if (passwordError.value) {
    apiError.value = "비밀번호가 일치하는지 확인해주세요.";
    return;
  }

  isLoading.value = true;

  try {
    const result = await signup(userName.value, password.value);
    console.log("회원가입 성공:", result.message);
    alert("회원가입이 성공적으로 완료되었습니다."); // Or use a more integrated notification system
    router.push("/login");
  } catch (error) {
    console.error("회원가입 실패:", error);
    apiError.value = error.message || "회원가입 중 오류가 발생했습니다.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Component-specific styles */
</style>
