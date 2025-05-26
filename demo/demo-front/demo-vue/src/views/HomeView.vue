<template>
  <div class="min-h-screen flex flex-col justify-center items-center">
    <div class="max-w-2xl w-full text-center bg-blue-50 p-10 rounded-lg shadow-md">
      <div class="mb-6 flex justify-center items-center">
        <img src="/microsoft.png" alt="Microsoft Logo" width="80" height="80" class="mr-6" />
        <h1 class="text-4xl font-bold text-blue-700">Demo Web</h1>
      </div>
      <p class="text-lg text-gray-600 mb-8 font-bold">Microsoft Playwright MCP 기본 테스트</p>
      <div class="flex flex-wrap justify-center gap-4">
        <router-link
          to="/login"
          class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 active:translate-y-[1px] transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          로그인
        </router-link>
        <router-link
          to="/signup"
          class="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 active:translate-y-[1px] transition duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
        >
          회원가입
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// 현재는 별도 로직 없음
</script>

<style scoped>
img {
  display: block;
}
</style>
