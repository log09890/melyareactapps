import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

// Định nghĩa các giá trị cho theme
const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // State giờ sẽ lưu một trong ba giá trị: 'light', 'dark', hoặc 'system'
  const [theme, setTheme] = useState(
    () => localStorage.getItem('melya-theme') || THEME_OPTIONS.SYSTEM
  );

  // Hàm để áp dụng class 'dark' hoặc 'light' vào thẻ <html>
  const applyTheme = useCallback(() => {
    const root = window.document.documentElement;
    
    // Xác định theme thực tế cần áp dụng
    const isDark =
      theme === THEME_OPTIONS.DARK ||
      (theme === THEME_OPTIONS.SYSTEM &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
        
    root.classList.remove(THEME_OPTIONS.LIGHT, THEME_OPTIONS.DARK);
    root.classList.add(isDark ? THEME_OPTIONS.DARK : THEME_OPTIONS.LIGHT);
  }, [theme]);


  useEffect(() => {
    // Lưu lựa chọn của người dùng
    localStorage.setItem('melya-theme', theme);
    applyTheme();

    // Nếu người dùng chọn "Theo thiết bị", chúng ta cần lắng nghe sự thay đổi
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        // Chỉ áp dụng lại theme nếu người dùng đang ở chế độ "system"
        if (theme === THEME_OPTIONS.SYSTEM) {
            applyTheme();
        }
    };

    mediaQuery.addEventListener('change', handleChange);
    // Dọn dẹp listener khi component bị unmount
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);


  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
