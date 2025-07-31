// src/context/AppConfigContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { db } from '/src/config/firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DATA_URLS as defaultUrls } from '/src/utils/constants.js';

const AppConfigContext = createContext();

export const useAppConfig = () => useContext(AppConfigContext);

// ID của tài liệu cấu hình trong Firestore
const CONFIG_DOC_ID = 'report_urls';

export const AppConfigProvider = ({ children }) => {
    const [reportUrls, setReportUrls] = useState(defaultUrls);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            setLoading(true);
            try {
                const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
                const docRef = doc(db, `artifacts/${appId}/public/data/app-config`, CONFIG_DOC_ID);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // Nếu có cấu hình trên Firestore, hợp nhất nó với các URL mặc định
                    // Điều này đảm bảo các báo cáo mới được thêm vào code vẫn hoạt động
                    setReportUrls(prev => ({ ...prev, ...docSnap.data() }));
                }
            } catch (error) {
                console.error("Lỗi khi tải cấu hình URL:", error);
            }
            setLoading(false);
        };
        fetchConfig();
    }, []);

    const saveReportUrls = async (newUrls) => {
        try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const docRef = doc(db, `artifacts/${appId}/public/data/app-config`, CONFIG_DOC_ID);
            await setDoc(docRef, newUrls, { merge: true });
            setReportUrls(prev => ({ ...prev, ...newUrls }));
            return true;
        } catch (error) {
            console.error("Lỗi khi lưu cấu hình URL:", error);
            return false;
        }
    };
    
    // Hàm này sẽ trả về URL đã được cấu hình hoặc URL mặc định
    const getReportUrl = (dataKey) => {
        return reportUrls[dataKey] || defaultUrls[dataKey];
    }

    const value = { reportUrls, loading, saveReportUrls, getReportUrl };

    return (
        <AppConfigContext.Provider value={value}>
            {children}
        </AppConfigContext.Provider>
    );
};
