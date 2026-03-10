# BreedGenetics - 全自動基因機率演算系統 🧬

![BreedGenetics Mockup](https://via.placeholder.com/800x400/0f172a/34d399?text=BreedGenetics+Calculator)

這是一個專為寵物繁育者設計的多基因機率分析系統，支援貓咪、守宮等多物種的顯隱性基因演算，並提供直觀的可視化數據分析。

## ✨ 特點功能

- **多物種支援**：預設內建貓咪與守宮基因庫，並支援自訂擴充。
- **直觀 UI/UX**：採用現代化 Glassmorphism 設計，支援手機/桌面端響應式操作。
- **高自由度設定**：內建「自訂基因庫」介面，無需寫程式即可新增/修改基因類型（顯性、隱性、不完全顯性）。
- **可視化分析**：透過圓餅圖與機率排行榜，精準呈現後代可能的特徵組合。
- **Docker 化部署**：支援一鍵部署，內建 Nginx 反向代理與 Flask 後端引擎。

## 🛠️ 技術庫

- **前端**: React 18, Vite, Tailwind CSS, Bootstrap 5, Recharts, Lucide React
- **後端**: Python 3.10, Flask, Gunicorn
- **部署**: Docker, Docker Compose, Nginx

## 🚀 快速啟動 (Local)

### 使用 Docker (最推薦)
確保您已安裝 Docker 與 Docker Desktop，然後在專案根目錄執行：

```bash
docker-compose up -d --build
```
啟動後，開啟瀏覽器造訪 `http://localhost` 即可使用。

### 手動啟動 (開發模式)

**後端 (Backend):**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

**前端 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

## 📖 如何新增自訂基因？

1. 點擊頁面右上角的 **⚙️ 設定** 圖示。
2. 選擇「目標物種」。
3. 輸入基因的顯示名稱、變數 ID 以及遺傳類型（顯性/隱性/複合）。
4. 點擊「儲存並套用」，設定將會自動同步至後端的 `data.json`。

## 📁 專案結構

- `/frontend`: React 原始碼與 Nginx 設定。
- `/backend`: Python 基因演算引擎、API 與 `data.json` 配置檔。
- `docker-compose.yml`: 容器編排設定。

## 📄 授權說明
本專案採 MIT 授權，歡迎自由修改與分享。