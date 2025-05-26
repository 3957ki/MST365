<template>
  <div class="container mx-auto p-8">
    <!-- 헤더 부분 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <router-link to="/board">
          <img
            src="/microsoft.png"
            alt="Microsoft Logo"
            width="50"
            height="50"
            class="mr-5 cursor-pointer"
          />
        </router-link>
        <h1 class="text-3xl font-bold text-black">자유 게시판</h1>
      </div>
      <div class="flex items-center space-x-3">
        <router-link to="/mypage">
          <button class="bg-green-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">
            마이 페이지
          </button>
        </router-link>
        <LogoutButton v-if="currentToken" />
      </div>
    </div>

    <div v-if="isLoadingInitial" class="text-center py-10">
      <p>게시물 목록을 불러오는 중...</p>
    </div>

    <div v-if="error && !isLoadingInitial" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong class="font-bold">오류 발생:</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>

    <BoardTable v-if="!isLoadingInitial && !error" :boards="boards" :token="currentToken" />

    <div v-if="!isLoadingInitial && !error && boards.length === 0" class="text-center py-10 text-gray-500">
      작성된 게시글이 없습니다.
    </div>

    <div v-if="isLoadingMore" class="text-center py-4">
      <p>추가 게시물을 불러오는 중...</p>
    </div>

    <div v-if="!hasMore && !isLoadingInitial && !isLoadingMore && !error && boards.length > 0" class="text-center py-4 text-gray-500">
      마지막 게시물입니다.
    </div>

    <WriteButton v-if="currentToken" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { getToken } from '@/services/api/auth.js';
import { getBoards } from '@/services/api/board.js';

// Assume these components will be created later
import BoardTable from '@/components/board/BoardTable.vue'; // Placeholder path
import WriteButton from '@/components/board/WriteButton.vue'; // Placeholder path
import LogoutButton from '@/components/common/LogoutButton.vue'; // Placeholder path

const boards = ref([]);
const currentPage = ref(0);
const pageSize = ref(20); // const in React, so ref() is fine
const isLoadingInitial = ref(true);
const isLoadingMore = ref(false);
const error = ref(null);
const hasMore = ref(true);
const currentToken = ref(null);

const router = useRouter();

const loadBoardsData = async () => {
  const token = currentToken.value; // Use ref value
  if (!token) {
    error.value = "로그인이 필요합니다.";
    isLoadingInitial.value = false;
    isLoadingMore.value = false;
    setTimeout(() => router.push("/login"), 1500);
    return;
  }

  if (currentPage.value === 0) {
    isLoadingInitial.value = true;
  } else {
    isLoadingMore.value = true;
  }
  error.value = null;

  try {
    const fetchedBoards = await getBoards(token, currentPage.value, pageSize.value);
    boards.value = [...boards.value, ...fetchedBoards];

    if (fetchedBoards.length < pageSize.value) {
      hasMore.value = false;
    }
  } catch (err) {
    error.value = err.message || "게시물 목록을 불러오는 중 오류가 발생했습니다.";
    hasMore.value = false;
  } finally {
    isLoadingInitial.value = false;
    isLoadingMore.value = false;
  }
};

onMounted(() => {
  currentToken.value = getToken();
  if (currentToken.value && hasMore.value) {
     loadBoardsData();
  } else if (!currentToken.value) {
    error.value = "로그인이 필요합니다.";
    isLoadingInitial.value = false;
    setTimeout(() => router.push("/login"), 1500);
  } else {
    isLoadingInitial.value = false; // No token but also no initial load if hasMore is false
  }

  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

watch(currentPage, (newPage, oldPage) => {
  if (newPage > oldPage && currentToken.value && hasMore.value && !isLoadingMore.value) {
    loadBoardsData();
  }
});


const handleScroll = () => {
  if (isLoadingInitial.value || isLoadingMore.value || !hasMore.value) {
    return;
  }
  // Check if the user has scrolled to near the bottom of the page
  // Using nextTick to ensure DOM updates are processed before checking scroll height
  nextTick(() => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200) {
        if (hasMore.value && !isLoadingMore.value) { // Double check to prevent multiple triggers
             currentPage.value += 1;
        }
      }
  });
};

</script>

<style scoped>
/* Component-specific styles */
</style>
