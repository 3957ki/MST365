import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/signup", element: _jsx(SignupPage, {}) }), _jsx(Route, { path: "/board", element: _jsx(BoardListPage, {}) }), _jsx(Route, { path: "/board/:board_id", element: _jsx(BoardDetailPage, {}) }), _jsx(Route, { path: "/board/new", element: _jsx(BoardNewPage, {}) }), _jsx(Route, { path: "/board/:board_id/edit", element: _jsx(BoardEditPage, {}) }), _jsx(Route, { path: "/mypage", element: _jsx(MyPage, {}) })] }) }));
}
export default App;
