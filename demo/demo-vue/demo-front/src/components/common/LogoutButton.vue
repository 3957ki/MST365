<template>
  <button
    @click="handleLogout"
    class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
  >
    로그아웃
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { getToken, removeToken, logout } from '@/services/api/auth.js';

const router = useRouter();

const handleLogout = async () => {
  const token = getToken();

  if (!token) {
    console.log("토큰 없음, 이미 로그아웃 상태일 수 있습니다.");
    router.push("/login");
    return;
  }

  try {
    await logout(token); // API 호출
    console.log("API 로그아웃 호출 성공");
  } catch (error) {
    console.error("로그아웃 API 호출 실패:", error);
    // 사용자에게 오류를 알릴 수 있음 (예: alert 또는 전역 알림 시스템)
    // alert(`로그아웃 중 오류 발생: ${error.message}`);
  } finally {
    removeToken();
    console.log("로컬 토큰 제거 완료");
    // 로그아웃 후 홈 페이지 또는 로그인 페이지로 리다이렉션
    router.push("/"); // 또는 router.push('/login');
    // Vue에서는 상태 관리가 다르므로, 페이지 새로고침(window.location.href) 대신
    // 상태 초기화 로직을 실행하거나, 전역 상태 관리(Pinia 등)를 통해 상태를 업데이트합니다.
    // 간단하게는 router.push 후 Vue가 reactivity에 따라 UI를 업데이트합니다.
  }
};
</script>

<style scoped>
/* Component-specific styles if needed */
</style>
