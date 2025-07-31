// src/context/ReportContext.jsx
import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { db, auth } from '../config/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { reportList as staticReports } from '../config/reportConfig';

const ReportContext = createContext({
  allReports: [],
  isLoading: true,
});

export const useReports = () => useContext(ReportContext);

export const ReportProvider = ({ children }) => {
  const [customReports, setCustomReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setAuthReady(true);
      if (!user) {
        setIsLoading(false); 
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!authReady || !auth.currentUser) return;

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    // **SỬA LỖI: Trỏ đến collection 'reports' nơi Engine lưu dữ liệu**
    const customReportsCollection = collection(db, `artifacts/${appId}/public/data/reports`);
    const q = query(customReportsCollection);

    const unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
      const reportsFromDb = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // **Cập nhật lại path để trỏ đến viewer mới của Engine**
        path: `/report/view/${doc.id}`, 
        isCustom: true, // Giữ cờ này để phân biệt với báo cáo tĩnh
      }));
      setCustomReports(reportsFromDb);
      setIsLoading(false);
    }, (error) => {
      console.error("Lỗi Firestore:", error.message);
      setIsLoading(false); 
    });

    return () => unsubscribeFirestore();
  }, [authReady]);

  const allReports = useMemo(() => {
    return [...staticReports, ...customReports].sort((a,b) => a.name.localeCompare(b.name));
  }, [customReports]);

  return (
    <ReportContext.Provider value={{ allReports, isLoading }}>
      {children}
    </ReportContext.Provider>
  );
};
