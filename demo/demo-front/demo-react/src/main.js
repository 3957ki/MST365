import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // App 컴포넌트 임포트 (다음 단계에서 생성/수정)
import './globals.css'; // 전역 CSS 임포트 (경로 수정됨, 파일 이동 필요)
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
