<template>
  <div class="container mx-auto p-8">
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
        <h1 class="text-3xl font-bold text-black">마이페이지</h1>
      </div>
      <LogoutButton />
    </div>

    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
      <div class="flex items-center">
        <div class="w-24 h-24 bg-gray-300 rounded-full mr-6 flex items-center justify-center text-gray-500">
          <span v-if="isUserInfoLoading">...</span>
          <span v-else-if="user">{{ user.userName.charAt(0).toUpperCase() }}</span>
          <span v-else>?</span>
        </div>
        <div class="text-left">
          <h2 class="text-2xl font-semibold mb-1 text-black">
            <span v-if="isUserInfoLoading">로딩 중...</span>
            <span v-else-if="userInfoError">오류</span>
            <span v-else>{{ user?.userName ?? "사용자" }}</span>
          </h2>
          <p class="text-gray-600">
            <span v-if="isUserInfoLoading">회원 정보를 불러오고 있습니다...</span>
            <span v-else-if="userInfoError">오류: {{ userInfoError }}</span>
            <span v-else-if="user">{{ user.userName }}님 안녕하세요!</span>
            <span v-else>회원 정보를 표시할 수 없습니다.</span>
          </p>
        </div>
      </div>
      <div class="mt-6 text-right">
        <button
          @click="isModalOpen = true"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-5"
        >
          비밀번호 수정
        </button>
        <button
          @click="handleWithdraw"
          :disabled="isWithdrawing"
          :class="[
            'bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded',
            isWithdrawing ? 'opacity-50 cursor-not-allowed' : ''
          ]"
        >
          {{ isWithdrawing ? "탈퇴 처리 중..." : "회원 탈퇴" }}
        </button>
      </div>
      <p v-if="withdrawError" class="text-red-500 text-sm mt-2 text-right">
        {{ withdrawError }}
      </p>
    </div>

    <!-- User Posts -->
    <div class="mb-6">
        <h3 class="text-xl font-semibold mb-3 text-black">작성한 게시글</h3>
        <p v-if="isUserPostsLoading" class="text-center text-gray-600 my-4">게시글 목록을 불러오는 중...</p>
        <p v-else-if="userPostsError" class="text-center text-red-500 my-4">게시글 목록 로딩 오류: {{ userPostsError }}</p>
        <UserPostsList v-else :posts="userPosts" />
    </div>

    <!-- User Comments -->
     <div>
        <h3 class="text-xl font-semibold mb-3 text-black">작성한 댓글</h3>
        <p v-if="isUserCommentsLoading" class="text-center text-gray-600 my-4">댓글 목록을 불러오는 중...</p>
        <p v-else-if="userCommentsError" class="text-center text-red-500 my-4">댓글 목록 로딩 오류: {{ userCommentsError }}</p>
        <UserCommentsList v-else :comments="userComments" />
    </div>


    <PasswordChangeModal
      :is-open="isModalOpen"
      @close="isModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import LogoutButton from '@/components/common/LogoutButton.vue'; // Corrected path assumption
// Assume these components will be created later
import PasswordChangeModal from '@/components/mypage/PasswordChangeModal.vue'; // Placeholder path
import UserPostsList from '@/components/mypage/UserPostsList.vue';       // Placeholder path
import UserCommentsList from '@/components/mypage/UserCommentsList.vue';   // Placeholder path

import { getToken, getUserId, removeToken, withdrawUser, getUserInfo, getUserPosts, getUserComments } from '@/services/api/auth.js';

const isModalOpen = ref(false);
const withdrawError = ref(null);
const isWithdrawing = ref(false);
const router = useRouter();

const user = ref(null);
const isUserInfoLoading = ref(true);
const userInfoError = ref(null);

const userPosts = ref(null);
const isUserPostsLoading = ref(true);
const userPostsError = ref(null);

const userComments = ref(null);
const isUserCommentsLoading = ref(true);
const userCommentsError = ref(null);

let isMounted = true; // Use a simple flag, or consider AbortController for fetch cancellation

onMounted(async () => {
  isMounted = true;
  const token = getToken();
  const userId = getUserId();

  if (!token || userId === null) {
    if (isMounted) {
      userInfoError.value = "로그인이 필요합니다.";
      userPostsError.value = "로그인이 필요합니다.";
      userCommentsError.value = "로그인이 필요합니다.";
      isUserInfoLoading.value = false;
      isUserPostsLoading.value = false;
      isUserCommentsLoading.value = false;
      router.push("/login");
    }
    return;
  }

  // Fetch User Info
  isUserInfoLoading.value = true;
  try {
    const userInfo = await getUserInfo(userId, token);
    if (isMounted) {
      user.value = userInfo;
      userInfoError.value = null;
    }
  } catch (error) {
    console.error("사용자 정보 조회 실패:", error);
    if (isMounted) {
      userInfoError.value = error.message || "사용자 정보를 불러오는 데 실패했습니다.";
      user.value = null;
      if (error.message?.includes("401") || error.message?.includes("403")) {
        removeToken();
        router.push("/login");
      }
    }
  } finally {
    if (isMounted) isUserInfoLoading.value = false;
  }

  // Fetch User Posts
  isUserPostsLoading.value = true;
  try {
    const posts = await getUserPosts(userId, token);
    if (isMounted) {
      userPosts.value = posts;
      userPostsError.value = null;
    }
  } catch (error) {
    console.error("사용자 게시물 조회 실패:", error);
    if (isMounted) {
      userPostsError.value = error.message || "게시물을 불러오는 데 실패했습니다.";
      userPosts.value = null;
    }
  } finally {
    if (isMounted) isUserPostsLoading.value = false;
  }

  // Fetch User Comments
  isUserCommentsLoading.value = true;
  try {
    const comments = await getUserComments(userId, token);
    if (isMounted) {
      userComments.value = comments;
      userCommentsError.value = null;
    }
  } catch (error) {
    console.error("사용자 댓글 조회 실패:", error);
    if (isMounted) {
      userCommentsError.value = error.message || "댓글을 불러오는 데 실패했습니다.";
      userComments.value = null;
    }
  } finally {
    if (isMounted) isUserCommentsLoading.value = false;
  }
});

onUnmounted(() => {
  isMounted = false;
});

const handleWithdraw = async () => {
  if (!confirm("정말로 회원 탈퇴를 진행하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
    return;
  }

  withdrawError.value = null;
  isWithdrawing.value = true;

  const token = getToken();
  const userId = getUserId();

  if (!token || userId === null) {
    withdrawError.value = "로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.";
    isWithdrawing.value = false;
    return;
  }

  try {
    await withdrawUser(userId, token);
    alert("회원 탈퇴가 성공적으로 처리되었습니다.");
    removeToken();
    router.push("/");
  } catch (error) {
    console.error("회원 탈퇴 실패:", error);
    withdrawError.value = error.message || "회원 탈퇴 중 오류가 발생했습니다.";
  } finally {
    isWithdrawing.value = false;
  }
};

</script>

<style scoped>
/* Component-specific styles */
</style>
