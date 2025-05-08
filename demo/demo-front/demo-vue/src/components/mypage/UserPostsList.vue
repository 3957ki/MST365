<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-6">
    <h3 class="text-xl font-semibold mb-4 text-black">내가 쓴 글</h3>
    <p v-if="!posts || posts.length === 0" class="text-gray-600">작성한 게시글이 없습니다.</p>
    <ul v-else class="space-y-2">
      <li v-for="post in posts" :key="post.id" class="border-b pb-2 text-black flex justify-between items-center">
        <router-link :to="`/board/${post.id}`" class="flex-grow mr-4 hover:text-blue-600">
          <p class="font-medium">{{ post.title }}</p>
          <p class="text-sm text-gray-500">
            작성일: {{ formatDate(post.createdAt) }}
          </p>
        </router-link>
        <p class="text-sm text-gray-500">조회수: {{ post.view }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  posts: {
    type: Array, // Can be null as well, handled in template
    default: () => null,
  },
});

const formatDate = (dateString) => {
  if (!dateString) return "날짜 정보 없음";
  try {
    // Assuming dateString is in ISO 8601 format or similar parseable format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid Date object");
    }
    // Format to YYYY.MM.DD
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\.$/, ''); // Remove trailing dot if present
  } catch (e) {
    console.error("Error parsing date:", dateString, e);
    return "날짜 형식 오류";
  }
};
</script>

<style scoped>
/* Component-specific styles if needed */
</style>
