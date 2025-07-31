// src/hooks/useScript.js
import { useState, useEffect } from 'react';

// Tạo một cache để tránh tải lại script đã có
const cachedScripts = new Map();

/**
 * Custom hook để tải một file JavaScript bên ngoài một cách linh động.
 * @param {string} src - URL của file script cần tải.
 * @returns {{loaded: boolean, error: boolean}} - Trạng thái tải của script.
 */
export const useScript = (src) => {
  const [status, setStatus] = useState({
    loaded: false,
    error: false,
  });

  useEffect(() => {
    // Nếu script đã có trong cache, sử dụng trạng thái đã lưu
    if (cachedScripts.has(src)) {
      const scriptStatus = cachedScripts.get(src);
      if (scriptStatus === 'loaded') {
        setStatus({ loaded: true, error: false });
      } else if (scriptStatus === 'error') {
        setStatus({ loaded: false, error: true });
      }
      return;
    }

    // Đánh dấu là đang tải
    cachedScripts.set(src, 'loading');
    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    const onScriptLoad = () => {
      cachedScripts.set(src, 'loaded');
      setStatus({ loaded: true, error: false });
    };

    const onScriptError = () => {
      cachedScripts.set(src, 'error');
      setStatus({ loaded: false, error: true });
      // Xóa script bị lỗi khỏi DOM
      document.body.removeChild(script);
    };

    script.addEventListener('load', onScriptLoad);
    script.addEventListener('error', onScriptError);

    document.body.appendChild(script);

    // Dọn dẹp listener khi component unmount
    return () => {
      script.removeEventListener('load', onScriptLoad);
      script.removeEventListener('error', onScriptError);
    };
  }, [src]);

  return status;
};

/**
 * Custom hook để tải một file CSS bên ngoài.
 * @param {string} href - URL của file stylesheet.
 */
export const useCss = (href) => {
    useEffect(() => {
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        }
    }, [href]);
};
