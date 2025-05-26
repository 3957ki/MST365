import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 페이지 컴포넌트 임포트 (새로운 경로 및 파일 이름 적용)
import HomePage from './pages/HomePage'; // ./app/page -> ./pages/HomePage.tsx
import LoginPage from './pages/LoginPage'; // ./app/login/page -> ./pages/LoginPage.tsx
import SignupPage from './pages/SignupPage'; // ./app/signup/page -> ./pages/SignupPage.tsx
import BoardListPage from './pages/BoardListPage'; // ./app/board/page -> ./pages/BoardListPage.tsx
import BoardDetailPage from './pages/BoardDetailPage'; // ./app/board/[board_id]/page -> ./pages/BoardDetailPage.tsx
import BoardNewPage from './pages/BoardNewPage'; // ./app/board/new/page -> ./pages/BoardNewPage.tsx
import BoardEditPage from './pages/BoardEditPage'; // ./app/board/[board_id]/edit/page -> ./pages/BoardEditPage.tsx
import MyPage from './pages/MyPage'; // ./app/mypage/page -> ./pages/MyPage.tsx

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 변경된 컴포넌트 이름 적용 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/board" element={<BoardListPage />} />
        {/* 동적 경로 설정: board_id 파라미터 사용 */}
        <Route path="/board/:board_id" element={<BoardDetailPage />} />
        <Route path="/board/new" element={<BoardNewPage />} />
        <Route path="/board/:board_id/edit" element={<BoardEditPage />} />
        <Route path="/mypage" element={<MyPage />} />
        {/* 필요한 경우 404 Not Found 페이지 라우트 추가 */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
