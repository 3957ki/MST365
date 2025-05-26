<template>
  <div class="container mx-auto p-8">
    <!-- 헤더 (로고 등) -->
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
    </div>

    <div v-if="isLoading" class="text-center">
      게시물 정보를 불러오는 중...
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong class="font-bold">오류 발생:</strong>
      <span class="block sm:inline"> {{ error }}</span>
      <router-link to="/board" class="block mt-2">
        <button class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
          목록으로 돌아가기
        </button>
      </router-link>
    </div>

    <div v-else-if="isNotFound" class="text-center">
      <p class="mb-4">요청하신 게시물을 찾을 수 없습니다.</p>
      <router-link to="/board">
        <button class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
          목록으로 돌아가기
        </button>
      </router-link>
    </div>

    <div v-else-if="board">
      <!-- 게시물 내용 -->
      <div class="bg-white shadow-md rounded-lg p-6 mb-6">
        <h1 class="text-2xl font-bold text-black mb-4 border-b pb-2">
          {{ board.title }}
        </h1>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-2 mb-4 text-sm text-gray-600">
          <div>
            <span class="font-semibold">작성자:</span>
            <span>
              {{ userName || (isLoadingUser ? "로딩중..." : `ID: ${board.userId}`) }}
            </span>
          </div>
          <div class="md:col-span-1 md:text-right">
            <span class="font-semibold">등록일:</span>
            {{ formatDateTime(board.createdAt) }}
          </div>
        </div>
        <div class="prose max-w-none mb-6 text-black" style="white-space: pre-wrap;">
          {{ board.content }}
        </div>
      </div>

      <!-- 버튼 영역 -->
      <div class="flex justify-end space-x-2 mt-5 mb-10">
        <template v-if="currentUserId === board.userId">
          <router-link :to="`/board/${board.id}/edit`">
            <button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
              수정
            </button>
          </router-link>
          <button
            class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleDeleteBoard"
            :disabled="isDeleting"
          >
            {{ isDeleting ? "삭제 중..." : "삭제" }}
          </button>
        </template>
        <router-link to="/board">
          <button class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
            목록
          </button>
        </router-link>
      </div>

      <!-- 댓글 섹션 (기본 구조만) -->
      <div class="bg-white shadow-md rounded-lg p-6">
        <h3 class="text-black text-xl font-semibold mb-4 border-b pb-2">댓글</h3>
        <!-- 댓글 목록 -->
        <div class="space-y-4 mb-6">
          <div v-for="comment in comments" :key="comment.id" class="border rounded-md p-4 bg-gray-50">
            <div class="flex justify-between items-center mb-2">
              <span class="font-semibold text-blue-600">
                {{ commentUserNames[comment.userId] || (isLoadingCommentUserMap[comment.userId] ? '로딩중...' : `ID: ${comment.userId}`) }}
              </span>

              <span class="text-sm text-gray-500">
                {{ comment.updatedAt && comment.updatedAt !== comment.createdAt
                  ? `수정됨 · ${new Date(comment.updatedAt).toLocaleString()}`
                  : new Date(comment.createdAt).toLocaleString() }}
              </span>
            </div>
             <div v-if="editingCommentId === comment.id">
                <textarea
                  class="w-full border border-gray-300 rounded-lg p-2 text-black mb-2"
                  v-model="editingContent"
                />
                <div class="flex justify-end space-x-2 mt-2">
                  <button @click="handleUpdateComment(comment.id)" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg text-sm">저장</button>
                  <button @click="cancelEditComment" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded-lg text-sm">취소</button>
                </div>
            </div>
            <div v-else>
                <p class="text-gray-800">{{ comment.content }}</p>
                <div v-if="currentUserId === comment.userId" class="flex justify-end space-x-2 mt-2">
                    <button @click="startEditComment(comment)" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg text-sm">수정</button>
                    <button @click="handleDeleteComment(comment.id)" class="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-sm">삭제</button>
                </div>
            </div>
          </div>
           <div v-if="comments.length === 0" class="text-gray-500">
            작성된 댓글이 없습니다.
          </div>
        </div>
        <!-- 댓글 작성 폼 -->
        <div>
          <h4 class="text-black text-lg font-semibold mb-2">댓글 작성</h4>
          <textarea
            class="w-full border border-gray-300 rounded-lg p-2 h-24 text-black mb-2"
            placeholder="댓글을 입력하세요"
            v-model="commentContent"
          />
          <button
            @click="handleCommentSubmit"
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            댓글 등록
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getUserInfo, getToken, getUserId } from '@/services/api/auth.js';
import { getBoardById, deleteBoard } from '@/services/api/board.js';
// Placeholder for comment API functions - will be properly imported after comment.js migration
import { getComments, createComment, updateComment, deleteComment } from '@/services/api/comment.js';


const route = useRoute();
const router = useRouter();

const board = ref(null);
const isLoading = ref(true);
const error = ref(null);
const isNotFound = ref(false);
const currentUserId = ref(null);
const isDeleting = ref(false);

const comments = ref([]);
const commentContent = ref('');
const editingCommentId = ref(null);
const editingContent = ref('');


const userName = ref('');
const isLoadingUser = ref(false);

const commentUserNames = ref({});
const isLoadingCommentUserMap = ref({});

const fetchUserNamesForComments = async () => {
  const token = getToken();
  if (!token || comments.value.length === 0) return;

  const userIdsToFetch = Array.from(
    new Set(comments.value.map(c => c.userId))
  ).filter(userId =>
    !commentUserNames.value[userId] && !isLoadingCommentUserMap.value[userId]
  );

  if (userIdsToFetch.length === 0) return;

  userIdsToFetch.forEach(id => isLoadingCommentUserMap.value[id] = true);

  try {
    const results = await Promise.all(
      userIdsToFetch.map(id =>
        getUserInfo(id, token).catch(() => null)
      )
    );

    const newMap = { ...commentUserNames.value };
    results.forEach(user => {
      if (user && user.id && user.userName) {
        newMap[user.id] = user.userName;
      }
    });
    commentUserNames.value = newMap;
  } finally {
    userIdsToFetch.forEach(id => isLoadingCommentUserMap.value[id] = false);
  }
};

const fetchCommentsData = async () => {
  try {
    const data = await getComments(Number(boardId.value));
    comments.value = data.filter(comment => !comment.deleted);
    await fetchUserNamesForComments();  // ← 여기 추가
  } catch (err) {
    console.error("댓글 불러오기 실패:", err.message);
  }
};



const fetchUserName = async () => {
  const token = getToken();
  if (!token || !board.value?.userId) return;

  isLoadingUser.value = true;
  try {
    const userInfo = await getUserInfo(board.value.userId, token);
    userName.value = userInfo?.userName || '';
  } catch (err) {
    console.error("작성자 이름 불러오기 실패:", err.message);
  } finally {
    isLoadingUser.value = false;
  }
};


const boardId = ref(route.params.id); // board_id from route

const formatDateTime = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "유효하지 않은 날짜";
    return date.toLocaleString("ko-KR", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    });
  } catch (e) {
    return "날짜 형식 오류";
  }
};

const fetchBoardData = async () => {
  isLoading.value = true;
  error.value = null;
  isNotFound.value = false;
  board.value = null;

  const token = getToken();
  const loggedInUserId = getUserId();
  currentUserId.value = loggedInUserId;

  if (!token) {
    error.value = "게시물 상세 정보를 보려면 로그인이 필요합니다.";
    isLoading.value = false;
    setTimeout(() => router.push("/login"), 1500);
    return;
  }

  if (!boardId.value) {
    error.value = "게시물 ID가 유효하지 않습니다.";
    isLoading.value = false;
    return;
  }

  try {
    const fetchedBoard = await getBoardById(boardId.value, token);
    if (fetchedBoard === null) {
      isNotFound.value = true;
    } else {
      board.value = fetchedBoard;

      await fetchUserName();           // ✅ 작성자 이름 가져오기
      await fetchCommentsData();       // 댓글 불러오기
    }
  } catch (err) {
    error.value = err.message || "게시물 정보를 불러오는 중 오류가 발생했습니다.";
  } finally {
    isLoading.value = false;
  }
};

const handleDeleteBoard = async () => {
  if (!board.value) return;
  if (!confirm("정말로 이 게시물을 삭제하시겠습니까?")) return;

  isDeleting.value = true;
  error.value = null;
  const token = getToken();
  if (!token) {
    alert("삭제 권한이 없습니다. 로그인이 필요합니다.");
    isDeleting.value = false;
    return;
  }

  try {
    await deleteBoard(board.value.id, token);
    alert("게시물이 성공적으로 삭제되었습니다.");
    router.push("/board");
  } catch (err) {
    error.value = err.message || "게시물 삭제 중 오류가 발생했습니다.";
    alert(`삭제 실패: ${error.value}`);
  } finally {
    isDeleting.value = false;
  }
};


const handleCommentSubmit = async () => {
  const token = getToken();
  if (!token) return alert("로그인이 필요합니다.");
  if (!commentContent.value.trim()) return alert("댓글 내용을 입력해주세요.");

  try {
    await createComment(Number(boardId.value), commentContent.value, token);
    alert("댓글이 작성되었습니다.");
    commentContent.value = "";
    await fetchCommentsData();
  } catch (err) {
    alert(`댓글 작성 실패: ${err.message}`);
  }
};

const startEditComment = (comment) => {
  editingCommentId.value = comment.id;
  editingContent.value = comment.content;
};

const cancelEditComment = () => {
  editingCommentId.value = null;
  editingContent.value = '';
};

const handleUpdateComment = async (commentId) => {
  const token = getToken();
  if (!token) return alert("로그인이 필요합니다.");
  if (!editingContent.value.trim()) return alert("댓글 내용을 입력해주세요.");

  try {
    await updateComment(Number(boardId.value), commentId, editingContent.value, token);
    alert("댓글이 수정되었습니다.");
    cancelEditComment();
    await fetchCommentsData();
  } catch (err) {
    alert(`댓글 수정 실패: ${err.message}`);
  }
};

const handleDeleteComment = async (commentId) => {
  const token = getToken();
  if (!token) return alert("로그인이 필요합니다.");
  if (!confirm("정말로 이 댓글을 삭제하시겠습니까?")) return;

  try {
    await deleteComment(Number(boardId.value), commentId, token);
    alert("댓글이 삭제되었습니다.");
    await fetchCommentsData();
  } catch (err) {
    alert(`댓글 삭제 실패: ${err.message}`);
  }
};


onMounted(() => {
  fetchBoardData();
});

// Watch for route param changes if navigating between detail views
watch(() => route.params.id, (newId) => {
  if (newId) {
    boardId.value = newId;
    fetchBoardData();
  }
});

</script>

<style scoped>
/* Add any component-specific styles here */
.prose { /* Basic prose styling, can be enhanced with @tailwindcss/typography */
  line-height: 1.6;
}
</style>
