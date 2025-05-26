<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" @click.self="closeModal">
    <form @submit.prevent="handleChangePassword" class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-black">비밀번호 변경</h2>

      <!-- 현재 비밀번호 -->
      <div class="mb-4">
        <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
        <input
          type="password"
          id="currentPassword"
          v-model="currentPassword"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
          required
          :disabled="isLoading"
        />
      </div>

      <!-- 새 비밀번호 -->
      <div class="mb-4">
        <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
        <input
          type="password"
          id="newPassword"
          v-model="newPassword"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
          required
          :disabled="isLoading"
        />
      </div>

      <!-- 새 비밀번호 확인 -->
      <div class="mb-2">
        <label for="confirmNewPassword" class="block text-sm font-medium text-gray-700 mb-1">새 비밀번호 확인</label>
        <input
          type="password"
          id="confirmNewPassword"
          v-model="confirmNewPassword"
          @input="clearPasswordMatchError"
          :class="[
            'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black',
            newPasswordMatchError ? 'border-red-500' : 'border-gray-300'
          ]"
          required
          :disabled="isLoading"
        />
      </div>
      <p v-if="newPasswordMatchError" class="text-red-500 text-xs mt-1 mb-4">{{ newPasswordMatchError }}</p>

      <!-- API 에러 또는 성공 메시지 -->
      <div class="mt-4 mb-4 h-5">
        <p v-if="apiError" class="text-red-500 text-sm text-center">{{ apiError }}</p>
        <p v-if="successMessage" class="text-green-600 text-sm text-center">{{ successMessage }}</p>
      </div>

      <!-- 버튼 영역 -->
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          @click="closeModal"
          :disabled="isLoading"
          :class="[
            'bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded',
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          ]"
        >
          취소
        </button>
        <button
          type="submit"
          :disabled="isLoading"
          :class="[
            'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded',
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          ]"
        >
          {{ isLoading ? "변경 중..." : "확인" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { getToken, changePassword } from '@/services/api/auth.js';

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(['close']);

const currentPassword = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');
const newPasswordMatchError = ref(null);
const apiError = ref(null);
const successMessage = ref(null);
const isLoading = ref(false);

// isOpen prop을 감시하여 모달이 닫힐 때 상태 초기화
watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    resetFormState();
  }
});

const resetFormState = () => {
  currentPassword.value = '';
  newPassword.value = '';
  confirmNewPassword.value = '';
  newPasswordMatchError.value = null;
  apiError.value = null;
  successMessage.value = null;
  isLoading.value = false;
};

const clearPasswordMatchError = () => {
    if (newPasswordMatchError.value) {
        newPasswordMatchError.value = null;
    }
};

const handleChangePassword = async () => {
  newPasswordMatchError.value = null;
  apiError.value = null;
  successMessage.value = null;

  if (!currentPassword.value || !newPassword.value || !confirmNewPassword.value) {
    apiError.value = "모든 비밀번호 필드를 입력해주세요.";
    return;
  }
  if (newPassword.value !== confirmNewPassword.value) {
    newPasswordMatchError.value = "새 비밀번호가 일치하지 않습니다.";
    return;
  }

  isLoading.value = true;
  const token = getToken();
  if (!token) {
    apiError.value = "로그인 토큰을 찾을 수 없습니다. 다시 로그인해주세요.";
    isLoading.value = false;
    return;
  }

  try {
    await changePassword(currentPassword.value, newPassword.value, confirmNewPassword.value, token);
    successMessage.value = "비밀번호가 성공적으로 변경되었습니다.";
    setTimeout(() => {
      closeModal(); // Emit close event after delay
    }, 1500);
  } catch (error) {
    console.error("비밀번호 변경 실패:", error);
    apiError.value = error.message || "비밀번호 변경 중 오류가 발생했습니다.";
  } finally {
    // Don't reset isLoading here if success message needs to be shown before closing
     if (apiError.value) { // Only set loading false immediately on error
         isLoading.value = false;
     }
     // On success, loading will implicitly become false when the modal closes and resets state
  }
};

const closeModal = () => {
  // Only emit close if not loading (to prevent accidental close during API call)
  // Or allow close anytime, but ensure state reset handles loading state if needed.
  // Let's allow closing anytime for user convenience.
  emit('close');
};

</script>

<style scoped>
/* Scoped styles for the modal if needed */
</style>
