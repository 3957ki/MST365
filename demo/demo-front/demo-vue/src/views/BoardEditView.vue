<template>
  <div class="container mx-auto p-8">
    <div class="flex items-center mb-6">
      <router-link to="/board">
        <img
          src="/microsoft.png"
          alt="Microsoft Logo"
          width="50"
          height="50"
          class="mr-5 cursor-pointer"
        />
      </router-link>
      <h1 class="text-3xl font-bold text-black">게시물 수정</h1>
    </div>

    <div v-if="isLoading" class="text-center">
      <p class="text-black">게시물 정보를 불러오는 중...</p>
    </div>
    <div v-else-if="notFound" class="text-center">
      <h1 class="text-2xl font-bold text-red-600 mb-4">게시물을 찾을 수 없습니다.</h1>
      <p class="text-black mb-4">요청하신 게시물이 존재하지 않거나 삭제되었을 수 있습니다.</p>
      <router-link to="/board" class="text-blue-600 hover:underline">게시판 목록으로 돌아가기</router-link>
    </div>
    <div v-else-if="errorLoading" class="text-center">
      <h1 class="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
      <p class="text-red-500 mb-4">{{ errorLoading }}</p>
      <router-link to="/board" class="text-blue-600 hover:underline">게시판 목록으로 돌아가기</router-link>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label for="title" class="block text-black font-semibold mb-2">제목</label>
        <input
          id="title"
          type="text"
          v-model="title"
          class="w-[80%] border border-gray-300 rounded-lg p-2 text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="제목을 입력하세요"
          :disabled="isUpdating"
        />
      </div>

      <div>
        <label for="content" class="block text-black font-semibold mb-2">내용</label>
        <textarea
          id="content"
          v-model="content"
          class="w-[80%] border border-gray-300 rounded-lg p-2 h-40 text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="내용을 입력하세요"
          :disabled="isUpdating"
        />
      </div>

      <p v-if="errorUpdating" class="text-red-500 text-sm">{{ errorUpdating }}</p>

      <div class="flex space-x-4">
        <button
          type="submit"
          :class="[
            'py-2 px-4 rounded-lg text-white',
            isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          ]"
          :disabled="isUpdating"
        >
          {{ isUpdating ? "수정 중..." : "수정하기" }}
        </button>
        <button
          type="button"
          @click="router.back()"
          class="py-2 px-4 rounded-lg bg-gray-300 text-black hover:bg-gray-400"
          :disabled="isUpdating"
        >
          취소
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getToken } from '@/services/api/auth.js';
import { getBoardById, updateBoard } from '@/services/api/board.js';

const route = useRoute();
const router = useRouter();
const boardId = route.params.id;

const title = ref('');
const content = ref('');

const isLoading = ref(true);
const errorLoading = ref(null);
const notFound = ref(false);

const isUpdating = ref(false);
const errorUpdating = ref(null);

onMounted(async () => {
  if (!boardId) {
    errorLoading.value = "게시물 ID를 찾을 수 없습니다.";
    isLoading.value = false;
    return;
  }

  const token = getToken();
  if (!token) {
    alert("로그인이 필요합니다.");
    router.push("/login");
    return;
  }

  try {
    isLoading.value = true;
    const boardData = await getBoardById(boardId, token);

    if (boardData === null) {
      notFound.value = true;
    } else {
      title.value = boardData.title;
      content.value = boardData.content;
      // Add any necessary authorization checks here if needed
    }
  } catch (error) {
    errorLoading.value = error instanceof Error ? error.message : "게시물 정보를 불러오는 중 오류가 발생했습니다.";
  } finally {
    isLoading.value = false;
  }
});

const handleSubmit = async () => {
  if (!title.value.trim() && !content.value.trim()) {
    errorUpdating.value = "수정할 제목이나 내용을 입력해주세요.";
    return;
  }

  isUpdating.value = true;
  errorUpdating.value = null;

  const token = getToken();
  if (!token) {
    errorUpdating.value = "인증 토큰이 없습니다. 다시 로그인해주세요.";
    isUpdating.value = false;
    return;
  }

  try {
    const updateData = { title: title.value, content: content.value };
    const updatedBoard = await updateBoard(boardId, updateData, token);
    alert("게시물이 성공적으로 수정되었습니다.");
    router.push(`/board/${updatedBoard.id}`);
  } catch (error) {
    errorUpdating.value = error instanceof Error ? error.message : "게시물 수정 중 오류가 발생했습니다.";
  } finally {
    isUpdating.value = false;
  }
};
</script>

<style scoped>
/* Component-specific styles if needed */
</style>
