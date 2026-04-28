# SALON&SPA

クルーズ船スパ施設向けオフラインファースト Web アプリ（PoC）。

セラピストがお客様と共有する iPad で、予約管理・カウンセリング記録・顧客情報を管理します。

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | React + TypeScript + Vite + TailwindCSS |
| 多言語対応 | i18next（日本語 / English / 中文 / 한국어） |
| ローカル DB | PouchDB（オフラインファースト） |
| バックエンド | FastAPI（Python） |
| サーバー DB | CouchDB |
| デプロイ | Docker Compose |

## セットアップ

### 開発環境（フロントエンド単体）

```bash
cd frontend
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開く。

### Docker Compose（全サービス）

```bash
# .env ファイルを作成
cp backend/.env.example backend/.env

# 起動
docker compose up --build
```

| サービス | URL |
|----------|-----|
| フロントエンド | http://localhost:3000 |
| バックエンド API | http://localhost:8000 |
| CouchDB | http://localhost:5984 |

## ディレクトリ構成

```
SALON&SPA/
├── frontend/          # React アプリ
│   ├── src/
│   │   ├── components/   # 共通コンポーネント
│   │   ├── pages/        # 各画面
│   │   ├── i18n/         # 多言語リソース
│   │   └── db/           # PouchDB 設定・同期
│   └── Dockerfile
├── backend/           # FastAPI
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
└── docker-compose.yml
```
