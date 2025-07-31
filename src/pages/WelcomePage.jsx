// src/pages/WelcomePage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

// Component icon SVG đơn giản để điều khiển âm thanh
const SoundOnIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);

const SoundOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9l4 4m0-4l-4 4" />
    </svg>
);


function WelcomePage() {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  // Đồng bộ hóa trạng thái 'muted' của video với state của component
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    // Container chính cần có position: relative để chứa video và lớp phủ
    <div className="relative flex flex-col items-center justify-center h-full text-center overflow-hidden rounded-lg shadow-2xl">
      
      {/* Video nền */}
      <video
        ref={videoRef}
        autoPlay
        loop
        // Thuộc tính 'muted' giờ đây được điều khiển bởi state thông qua useEffect
        // Các class Tailwind để video tự động phát, lặp lại, tắt tiếng và bao phủ toàn bộ container
        className="absolute top-1/2 left-1/2 w-auto min-w-full min-h-full max-w-none transform -translate-x-1/2 -translate-y-1/2 z-0"
      >
        <source 
          src="src/resource/_a_topdown_202506252001_mxjwt.mp4" 
          type="video/mp4" 
        />
        Trình duyệt của bạn không hỗ trợ thẻ video.
      </video>

      {/* Lớp phủ mờ */}
      <div className="absolute top-0 left-0 w-full h-full bg-slate-900/60 z-10"></div>
      
      {/* Nút điều khiển âm thanh */}
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-4 right-4 z-30 p-2 text-white bg-black/30 rounded-full hover:bg-black/50 transition-colors"
        title={isMuted ? "Bật tiếng" : "Tắt tiếng"}
      >
        {isMuted ? <SoundOffIcon /> : <SoundOnIcon />}
      </button>

      {/* Nội dung chính của trang, nằm trên video và lớp phủ */}
      <div className="relative z-20 max-w-3xl p-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-white animate-fade-in-down">
          Chào mừng đến với Melya Report System
        </h1>
        <p className="mt-4 text-lg text-slate-200 animate-fade-in-up">
          Hệ thống báo cáo và phân tích dữ liệu kinh doanh của Melya.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4 animate-fade-in">
          <NavLink
            to="/reports"
            className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 transition-transform hover:scale-105"
          >
            Xem Danh mục 
          </NavLink>
          <NavLink
            to="/comparison"
            className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-transform hover:scale-105"
          >
            So sánh Báo cáo
          </NavLink>
           <NavLink
            to="/settings"
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-transform hover:scale-105"
          >
            Cài đặt
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
