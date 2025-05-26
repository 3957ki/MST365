"use client";

import { useState, FormEvent, useEffect } from "react";
import { getToken, changePassword } from "@/app/api/auth";

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PasswordChangeModal({ isOpen, onClose }: PasswordChangeModalProps) {
  // 상태 관리: 현재 비밀번호, 새 비밀번호, 오류 메시지 등
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [newPasswordMatchError, setNewPasswordMatchError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 모달이 닫힐 때 입력값 및 메시지 초기화
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

  // 비밀번호 변경 요청 처리: 유효성 검사 → API 호출 → 성공/오류 처리
  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNewPasswordMatchError(null);
    setApiError(null);
    setSuccessMessage(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      // 입력 필드가 모두 채워졌는지 확인
      setApiError("모든 비밀번호 필드를 입력해주세요.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      // 새 비밀번호와 확인 비밀번호가 일치하는지 확인
      setNewPasswordMatchError("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    setIsLoading(true);

    const token = getToken();
    if (!token) {
      setApiError("로그인 토큰을 찾을 수 없습니다. 다시 로그인해주세요.");
      setIsLoading(false);
      return;
    }

    try {
      await changePassword(currentPassword, newPassword, confirmNewPassword, token);

      setSuccessMessage("비밀번호가 성공적으로 변경되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      // 실패 처리
      console.error("비밀번호 변경 실패:", error);
      setApiError(error.message || "비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 모달이 닫힌 경우 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <form onSubmit={handleChangePassword} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-black">비밀번호 변경</h2>
        <div className="mb-4">
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
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
        <div className="mb-4">
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
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
        <div className="mb-2">
          <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
            새 비밀번호 확인
          </label>
          <input
            type="password"
            id="confirmNewPassword"
            value={confirmNewPassword}
            onChange={(e) => {
              setConfirmNewPassword(e.target.value);
              if (newPasswordMatchError) setNewPasswordMatchError(null);
            }}
            className={`w-full px-3 py-2 border ${
              newPasswordMatchError ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black`}
            required
            disabled={isLoading}
          />
        </div>
        {newPasswordMatchError && <p className="text-red-500 text-xs mt-1 mb-4">{newPasswordMatchError}</p>}

        <div className="mt-4 mb-4 h-5">
          {apiError && <p className="text-red-500 text-sm text-center">{apiError}</p>}
          {successMessage && <p className="text-green-600 text-sm text-center">{successMessage}</p>}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "변경 중..." : "확인"}
          </button>
        </div>
      </form>
    </div>
  );
}
