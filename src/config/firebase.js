// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Sử dụng thông tin cấu hình bạn đã cung cấp
const firebaseConfig = {
  apiKey: "AIzaSyBxCXnC3z3VW9vGoDjq8TAn25JIXgwmur0",
  authDomain: "melya-report-system.firebaseapp.com",
  projectId: "melya-report-system",
  storageBucket: "melya-report-system.appspot.com",
  messagingSenderId: "404785973822",
  appId: "1:404785973822:web:98093be37f1761bf341f6f",
  measurementId: "G-FP3RPQPW7T"
};

// Khởi tạo ứng dụng Firebase
const app = initializeApp(firebaseConfig);

// Lấy các dịch vụ chúng ta cần
const db = getFirestore(app);
const auth = getAuth(app);

// Tự động đăng nhập ẩn danh để có quyền truy cập
// Điều này rất quan trọng để ứng dụng có thể đọc dữ liệu từ Firestore
signInAnonymously(auth).catch((error) => {
  console.error("Lỗi đăng nhập ẩn danh:", error);
});

// Xuất các dịch vụ để sử dụng trong ứng dụng
export { db, auth };
