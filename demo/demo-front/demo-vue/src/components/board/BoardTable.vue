<template>
  <table class="w-full border-collapse border border-gray-300 mb-4 text-black">
    <thead class="bg-gray-100">
      <tr>
        <th class="border p-2 w-16">번호</th>
        <th class="border p-2">제목</th>
        <th class="border p-2 w-32">작성자</th>
        <th class="border p-2 w-32">작성일</th>
        
      </tr>
    </thead>
    <tbody>
      <tr v-if="boards.length === 0">
        <td colSpan="5" class="text-center p-4 border">
          작성된 게시글이 없습니다.
        </td>
      </tr>
      <tr v-for="board in boards" :key="board.id" class="hover:bg-gray-50">
        <td class="border p-2 text-center">{{ board.id }}</td>
        <td class="border p-2 hover:underline">
          <router-link :to="`/board/${board.id}`">{{ board.title }}</router-link>
        </td>
        <td class="border p-2 text-center">
          {{ userNamesMap[board.userId] || (loadingUserNamesMap[board.userId] ? "로딩중..." : `ID: ${board.userId}`) }}
        </td>
        <td class="border p-2 text-center">
          {{ formatDate(board.createdAt) }}
        </td>
        
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { ref, watch, defineProps } from 'vue';
import { getUserInfo } from '@/services/api/auth.js'; // Ensure this path is correct

const props = defineProps({
  boards: {
    type: Array,
    required: true,
  },
  token: {
    type: String,
    default: null,
  },
});

const userNamesMap = ref({});
// Individual loading state per user ID for better UX
const loadingUserNamesMap = ref({});


const fetchUserNamesForBoards = async (boardsToFetch, token) => {
  if (!token || boardsToFetch.length === 0) {
    return;
  }

  const uniqueUserIdsToFetch = Array.from(
    new Set(boardsToFetch.map((board) => board.userId))
  ).filter((userId) => !userNamesMap.value[userId] && !loadingUserNamesMap.value[userId]);

  if (uniqueUserIdsToFetch.length === 0) {
    return;
  }

  uniqueUserIdsToFetch.forEach(userId => loadingUserNamesMap.value[userId] = true);

  try {
    const userInfoPromises = uniqueUserIdsToFetch.map((userId) =>
      getUserInfo(userId, token).catch(err => {
        console.error(`Error fetching user info for ID ${userId}:`, err);
        return null; // Return null on error for individual fetch
      })
    );
    const userInfos = await Promise.all(userInfoPromises);

    const newUserNames = { ...userNamesMap.value };
    userInfos.forEach((userInfo) => {
      if (userInfo && userInfo.id && userInfo.userName) {
        newUserNames[userInfo.id] = userInfo.userName;
      }
    });
    userNamesMap.value = newUserNames;

  } catch (error) {
    console.error("사용자 이름 일괄 조회 중 오류 발생:", error);
  } finally {
    uniqueUserIdsToFetch.forEach(userId => loadingUserNamesMap.value[userId] = false);
  }
};

// Watch for changes in boards prop to fetch user names
watch(
  () => props.boards,
  (newBoards, oldBoards) => {
    if (props.token && newBoards.length > 0) {
      // Determine which user IDs are new or haven't been fetched
      // const currentBoardUserIds = new Set(newBoards.map(b => b.userId)); // Removed unused variable
      const oldBoardUserIds = oldBoards ? new Set(oldBoards.map(b => b.userId)) : new Set();
      
      const idsToFetchFor = newBoards.filter(b => !oldBoardUserIds.has(b.userId) || !userNamesMap.value[b.userId]);

      if(idsToFetchFor.length > 0){
         fetchUserNamesForBoards(idsToFetchFor, props.token);
      }
    }
  },
  { immediate: true, deep: true } // immediate to run on component mount, deep for array changes
);


const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "유효하지 않은 날짜";
    }
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\.$/, '');
  } catch (error) {
    console.error("Error formatting date:", error);
    return "날짜 형식 오류";
  }
};
</script>

<style scoped>
/* Component-specific styles if needed */
</style>
