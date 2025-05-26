"use client";

import { useState, FormEvent, useEffect } from "react"; // FormEvent, useEffect 추가
import { getToken, changePassword } from "@/app/api/auth"; // 경로 수정 (@ 사용 또는 상대경로)
import "./PasswordChangeModal.css";

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
    <div className="modal-overlay">
      <form
        onSubmit={handleChangePassword}
        className="modal-content"
      >
        <h2 className="modal-title">비밀번호 변경</h2>
        {/* 현재 비밀번호 */}
        <div className="form-group">
          <label
            htmlFor="currentPassword"
            className="form-label"
          >
            현재 비밀번호
          </label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="form-input"
            required
            disabled={isLoading}
          />
        </div>
        {/* 새 비밀번호 */}
        <div className="form-group">
          <label
            htmlFor="newPassword"
            className="form-label"
          >
            새 비밀번호
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="form-input"
            required
            disabled={isLoading}
          />
        </div>
        {/* 새 비밀번호 확인 */}
        <div className="form-group-mb-2"> {/* 에러 메시지 공간 확보 위해 mb 줄임 */}
          <label
            htmlFor="confirmNewPassword"
            className="form-label"
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
            className={`form-input ${newPasswordMatchError ? 'form-input-error' : ''}`}
            required
            disabled={isLoading}
          />
        </div>
        {/* 새 비밀번호 불일치 에러 메시지 */}
        {newPasswordMatchError && (
          <p className="error-text-xs">{newPasswordMatchError}</p>
        )}

        {/* API 에러 또는 성공 메시지 표시 */}
        <div className="message-container"> {/* 메시지 영역 높이 고정 */}
          {apiError && <p className="api-error-text">{apiError}</p>}
          {successMessage && <p className="success-text">{successMessage}</p>}
        </div>

        {/* 버튼 영역 */}
        <div className="button-group">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={`cancel-button ${isLoading ? 'button-disabled' : ''}`}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`confirm-button ${isLoading ? 'button-disabled' : ''}`}
          >
            {isLoading ? "변경 중..." : "확인"}
          </button>
        </div>
      </form>
    </div>
  );
}
