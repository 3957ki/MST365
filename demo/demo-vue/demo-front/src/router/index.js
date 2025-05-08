import { createRouter, createWebHistory } from 'vue-router';
// Import HomeView instead of HelloWorld for the home route
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import SignupView from '../views/SignupView.vue';
import BoardListView from '../views/BoardListView.vue';
import BoardCreateView from '../views/BoardCreateView.vue';
import BoardDetailView from '../views/BoardDetailView.vue';
import BoardEditView from '../views/BoardEditView.vue';
import MyPageView from '../views/MyPageView.vue'; // Import MyPageView

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView, // Use HomeView for the home page
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView, // Add Login route
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupView,
  },
  {
    path: '/board',
    name: 'BoardList',
    component: BoardListView,
  },
  {
    path: '/board/new',
    name: 'BoardCreate',
    component: BoardCreateView,
  },
  {
    path: '/board/:id', // Dynamic segment for board ID
    name: 'BoardDetail',
    component: BoardDetailView,
    props: true,
  },
  {
    path: '/board/:id/edit', // Dynamic segment for board ID edit
    name: 'BoardEdit',
    component: BoardEditView,
    props: true,
  },
  {
    path: '/mypage',
    name: 'MyPage',
    component: MyPageView, // Add MyPage route
  },
  // We will add more routes later based on the Next.js project
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL), // Or import.meta.env.BASE_URL for Vite
  routes,
});

export default router;
