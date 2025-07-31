// src/config/chart-config.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

/**
 * Đăng ký tất cả các thành phần cần thiết cho Chart.js.
 * Việc này chỉ cần thực hiện một lần cho toàn bộ ứng dụng.
 */
export const setupCharts = () => {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
  );
};
