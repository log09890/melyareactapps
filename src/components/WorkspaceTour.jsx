// src/components/WorkspaceTour.jsx
import React, { useEffect } from 'react';

const WorkspaceTour = ({ enabled, onExit }) => {
    // **Cập nhật các bước hướng dẫn**
    const steps = [
        {
            element: '.tour-step-1-header',
            intro: 'Đây là thanh điều hướng chính, giúp bạn truy cập các khu vực khác nhau của ứng dụng như Trang chủ, Danh mục Báo cáo, và Cài đặt.',
            position: 'bottom',
        },
        {
            element: '.tour-step-2-workspace',
            intro: 'Khu vực này là không gian làm việc chính, nơi nội dung của các báo cáo bạn mở sẽ được hiển thị.',
            position: 'right',
        },
        {
            element: '.tour-step-3-sidebar',
            intro: 'Và đây là thanh bên quản lý các báo cáo đang mở. Các icon của những báo cáo bạn đã mở sẽ xuất hiện ở đây.',
            position: 'left',
        },
        // **BƯỚC MỚI: Hướng dẫn nút thêm báo cáo**
        {
            element: '.tour-step-add-report',
            intro: 'Bạn có thể nhanh chóng tạo một báo cáo mới bằng cách nhấp vào nút dấu cộng này.',
            position: 'left',
        },
        {
            element: '.tour-step-4-sidebar-icon',
            intro: 'Nhấp vào một icon để chuyển đổi qua lại giữa các báo cáo. Dữ liệu sẽ không cần tải lại!',
            position: 'left',
        },
        {
            element: '.tour-step-5-close-icon',
            intro: 'Để đóng một báo cáo, hãy di chuột vào icon và nhấp vào dấu (×) nhỏ xuất hiện.',
            position: 'left',
        },
        {
            element: '.tour-step-6-help-button',
            intro: 'Bạn có thể mở lại hướng dẫn này bất cứ lúc nào bằng cách nhấp vào nút dấu hỏi này. Chúc bạn có một trải nghiệm hiệu quả!',
            position: 'top',
        }
    ];

    useEffect(() => {
        const loadCss = (href) => {
            if (!document.querySelector(`link[href="${href}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                document.head.appendChild(link);
            }
        };

        const loadScript = (src) => {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Lỗi khi tải script: ${src}`));
                document.body.appendChild(script);
            });
        };

        const startTour = async () => {
            try {
                loadCss('https://cdnjs.cloudflare.com/ajax/libs/intro.js/7.2.0/introjs.min.css');
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/intro.js/7.2.0/intro.min.js');

                if (typeof window.introJs === 'function') {
                    const intro = window.introJs();
                    intro.setOptions({
                        steps,
                        nextLabel: 'Tiếp',
                        prevLabel: 'Trước',
                        doneLabel: 'Hoàn thành',
                        tooltipClass: 'custom-tooltip-class',
                        exitOnOverlayClick: true,
                        showProgress: true,
                        overlayOpacity: 0.7,
                    });
                    intro.onexit(onExit);
                    intro.start();
                } else {
                    throw new Error('Hàm introJs không tồn tại.');
                }
            } catch (error) {
                console.error("Không thể bắt đầu tour hướng dẫn:", error);
                onExit();
            }
        };

        if (enabled) {
            startTour();
        }
    }, [enabled, onExit]);

    return null; 
};

export default WorkspaceTour;
