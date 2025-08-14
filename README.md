# Real-Time Collaborative Document Editor

Tech stack: React (Vite) + Socket.IO + Node/Express + MongoDB (Mongoose) + Quill.js

## Prerequisites
- Node.js 18+
- MongoDB running locally or in the cloud (e.g., MongoDB Atlas)

## Setup

### 1) Backend
```bash
cd backend
cp .env.example .env
# edit .env to set MONGO_URI and CLIENT_ORIGIN if needed
npm install
npm run dev
