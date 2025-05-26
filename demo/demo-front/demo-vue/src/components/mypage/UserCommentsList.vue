<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-xl font-semibold mb-4 text-black">내가 쓴 댓글</h3>
    <p v-if="!comments || comments.length === 0" class="text-gray-600">작성한 댓글이 없습니다.</p>
    <ul v-else class="space-y-3">
      <li v-for="comment in comments" :key="comment.id" class="border-b pb-3 text-black">
        <p class="mb-1">"{{ comment.content }}"</p>
        <p class="text-sm text-gray-600">
          작성일: {{ formatDate(comment.createdAt) }}
          | <router-link :to="`/board/${comment.boardId}`" class="text-blue-600 hover:underline">원본 게시글 보기</router-link>
        </p>
        <!-- Optionally display deleted status if needed -->
        <!-- <p v-if="comment.deleted" class="text-xs text-red-500">(삭제된 댓글)</p> -->
      </li>
    </ul>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  comments: {
    type: Array, // Can be null as well, handled in template
    default: () => null,
  },
});

const formatDate = (dateString) => {
  if (!dateString) return "날짜 정보 없음";
  try {
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
    console.error("Error parsing comment date:", dateString, e);
    return "날짜 형식 오류";
  }
};
</script>

<style scoped>
/* Component-specific styles if needed */
</style>
