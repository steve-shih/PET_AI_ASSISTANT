# BreedGenetics - 寵物基因機率演算系統 🧬

![BreedGenetics Banner](https://img.shields.io/badge/Status-Beta-brightgreen)
![GCP Deployment](https://img.shields.io/badge/Platform-GCP-blue)
![Docker Supported](https://img.shields.io/badge/Docker-Ready-blue)


DEMO https://www.youtube.com/watch?v=MQBig3pq0t0
這是一個專為寵物繁育者設計的高級基因機率分析系統，目前支援 **貓咪 (Cat)** 與 **守宮 (Gecko)** 的多基因組合演算。
使用畫面~~~ 
<img width="1891" height="619" alt="image" src="https://github.com/user-attachments/assets/9d0de98c-ff03-4b87-8cc4-ed16efad5299" />
<img width="1875" height="792" alt="image" src="https://github.com/user-attachments/assets/93223248-727d-4265-92cf-4c0ac3a1a3e0" />
<img width="663" height="796" alt="image" src="https://github.com/user-attachments/assets/f1dc601f-0d30-4628-9527-88a732ff60e4" />


---

## ✨ 核心功能

- **多物種選擇**：內建貓咪與守宮物種，支援不同的遺傳模型。
- **自訂基因庫**：透過 GUI 介面直觀地新增或修改基因（支援顯性、隱性、複合與特殊規則）。
- **機率可視化**：自動生成後代特徵分佈圓餅圖與機率清單。
- **專業級部署**：完整的 Docker 化流程，具備 Nginx 反向代理與自動化 CI/CD。

---

## 🛠️ 快速啟動

### 1. 使用 Docker Compose (最快啟動)
確保已安裝 Docker，在專案目錄執行：
```bash
docker-compose up -d --build
```
造訪 `http://localhost` 即可。

### 2. 本地開發模式

**後端 (Python/Flask):**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

**前端 (React/Vite):**
```bash
cd frontend
npm install
npm run dev
```

---

## ☁️ 雲端部署與 CI/CD

本專案支援 **Google Cloud Platform (GCP)** 的自動化部署：
- 每當程式碼推送到 `main` 分支時，GitHub Actions 會自動執行測試。
- 測試通過後，會透過 SSH 自動連線至 GCP 主機並更新服務。

---

## 📁 目錄結構

- `frontend/`: React 前端程式碼與 Nginx 設定
- `backend/`: Flask 演算引擎與 `data.json` 配置
- `.github/workflows/`: GitHub Actions 自動化腳本
- `docker-compose.yml`: 容器編排設定檔

---

## 📄 授權與社群
本專案採 MIT 授權。
由 [Steve Shih](https://github.com/steve-shih) 開發。
