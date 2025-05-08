// "use client"; // Removed "use client" directive

import { useState, FormEvent, useEffect } from "react"; // FormEvent, useEffect 추가
import { getToken, changePassword } from "../../../api-temp/auth"; // Corrected relative path again

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PasswordChangeModal({
  isOpen,
  onClose,
}: PasswordChangeModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [newPasswordMatchError, setNewPasswordMatchError] = useState<string | null>(null); // 새 비밀번호 불일치 에러
  const [apiError, setApiError] = useState<string | null>(null); // API 에러
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // 성공 메시지
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setNewPasswordMatchError(null);
      setApiError(null);
      setSuccessMessage(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 상태 초기화
    setNewPasswordMatchError(null);
    setApiError(null);
    setSuccessMessage(null);

    // 클라이언트 측 유효성 검사
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setApiError("모든 비밀번호 필드를 입력해주세요.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setNewPasswordMatchError("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    // (선택 사항) 새 비밀번호 정책 검사 (예: 길이)
    // if (newPassword.length < 8) {
    //   setApiError("새 비밀번호는 8자 이상이어야 합니다.");
    //   return;
    // }

    setIsLoading(true); // 로딩 시작

    const token = getToken();
    if (!token) {
      setApiError("로그인 토큰을 찾을 수 없습니다. 다시 로그인해주세요.");
      setIsLoading(false);
      return;
    }

    try {
      await changePassword(currentPassword, newPassword, confirmNewPassword, token);

      // 성공 처리
      setSuccessMessage("비밀번호가 성공적으로 변경되었습니다.");
      setCurrentPassword(""); // 필드 초기화
      setNewPassword("");
      setConfirmNewPassword("");
      // 잠시 후 모달 닫기 (성공 메시지 보여주기 위해)
      setTimeout(() => {
        onClose();
      }, 1500); // 1.5초 후 닫기

    } catch (error: any) {
      // 실패 처리
      console.error("비밀번호 변경 실패:", error);
      setApiError(error.message || "비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false); // 로딩 종료 (성공 시에는 이미 false지만, 실패 시 확실히)
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <form
        onSubmit={handleChangePassword}
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-black">비밀번호 변경</h2>
        {/* 현재 비밀번호 */}
        <div className="mb-4">
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            현재 비밀번호
          </label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
            required
            disabled={isLoading}
          />
        </div>
        {/* 새 비밀번호 */}
        <div className="mb-4">
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            새 비밀번호
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
            required
            disabled={isLoading}
          />
        </div>
        {/* 새 비밀번호 확인 */}
        <div className="mb-2"> {/* 에러 메시지 공간 확보 위해 mb 줄임 */}
          <label
            htmlFor="confirmNewPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            새 비밀번호 확인
          </label>
          <input
            type="password"
            id="confirmNewPassword"
            value={confirmNewPassword}
            onChange={(e) => {
              setConfirmNewPassword(e.target.value);
              // 입력 시 비밀번호 일치 에러 초기화
              if (newPasswordMatchError) setNewPasswordMatchError(null);
            }}
            className={`w-full px-3 py-2 border ${newPasswordMatchError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black`}
            required
            disabled={isLoading}
          />
        </div>
        {/* 새 비밀번호 불일치 에러 메시지 */}
        {newPasswordMatchError && (
          <p className="text-red-500 text-xs mt-1 mb-4">{newPasswordMatchError}</p>
        )}

        {/* API 에러 또는 성공 메시지 표시 */}
        <div className="mt-4 mb-4 h-5"> {/* 메시지 영역 높이 고정 */}
          {apiError && <p className="text-red-500 text-sm text-center">{apiError}</p>}
          {successMessage && <p className="text-green-600 text-sm text-center">{successMessage}</p>}
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? "변경 중..." : "확인"}
          </button>
        </div>
      </form>
    </div>
  );
}
