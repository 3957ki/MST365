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
      <h1 class="text-3xl font-bold text-black">게시물 작성</h1>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label for="title" class="block text-black font-semibold mb-2">제목</label>
        <input
          type="text"
          id="title"
          v-model="title"
          class="w-[80%] border border-gray-300 rounded-lg p-2 text-black"
          placeholder="제목을 입력하세요"
        />
      </div>
      <div>
        <label for="content" class="block text-black font-semibold mb-2">내용</label>
        <textarea
          id="content"
          v-model="content"
          class="w-[80%] border border-gray-300 rounded-lg p-2 h-40 text-black"
          placeholder="내용을 입력하세요"
        />
      </div>
      <button
        type="submit"
        class="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
      >
        작성하기
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getToken, getUserId } from '@/services/api/auth.js';
import { createBoard } from '@/services/api/board.js';

const title = ref('');
const content = ref('');
const router = useRouter();

const handleSubmit = async () => {
  if (!title.value || !content.value) {
    alert("제목과 내용을 모두 입력해주세요."); // Consider a more integrated notification system
    return;
  }

  const token = getToken();
  const userId = getUserId();

  if (!token || userId === null) {
    alert("로그인이 필요합니다."); // Consider redirecting or a global auth check
    router.push('/login');
    return;
  }

  try {
    await createBoard({ title: title.value, content: content.value, userId }, token);
    alert("게시글이 작성되었습니다.");
    router.push("/board"); // Navigate to board list page
  } catch (err) {
    alert(`에러 발생: ${err.message}`);
    console.error("Error creating board:", err);
  }
};
</script>

<style scoped>
/* Component-specific styles if needed */
</style>
