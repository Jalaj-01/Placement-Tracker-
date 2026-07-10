# 🚀 PlacementTracker Deployment Guide

This guide details how to host both the frontend and backend parts of **PlacementTracker** online for free, enabling real-time, multi-device sync and push notifications on your phone.

---

## 🏗️ Architecture Overview

1. **Database & Auth (Firebase):** Configured to run in the cloud. It naturally supports real-time multi-device sync out of the box.
2. **Frontend client (`/client`):** A React app built with Vite. Hosted on **Vercel** (Free, high performance, automatic PWA generation).
3. **Backend server (`/server`):** An Express API node that performs AI web scraping (`/api/parse-url`). Hosted on **Render** (Free web services).

---

## 🌐 Part 1: Deploying the Backend on Render (Free)

[Render](https://render.com/) is a cloud hosting platform that offers a free tier for Node.js Express web services.

### Steps:
1. Sign up on [Render](https://render.com/) (using your GitHub account).
2. Click **New +** and select **Web Service**.
3. Link your GitHub repository.
4. Set the following configurations:
   - **Name:** `placement-tracker-backend`
   - **Root Directory:** `server` *(Important: Point this to the server subdirectory)*
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Instance Type:** `Free`
5. Go to the **Environment** tab inside your Render service dashboard and add any variables from your local environment (such as `PORT=3001` or your AI endpoint keys if applicable).
6. Click **Deploy Web Service**.
7. Once deployed, Render will provide a public URL like: `https://placement-tracker-backend.onrender.com`. Copy this URL!

---

## 💻 Part 2: Deploying the Frontend Client on Vercel (Free)

[Vercel](https://vercel.com/) is the premium hosting solution for React apps. It offers automatic build pipelines and free SSL.

### Steps:
1. Sign up on [Vercel](https://vercel.com/) (using your GitHub account).
2. Click **Add New** and select **Project**.
3. Import your `Placement-Tracker-` GitHub repository.
4. Set the following configurations:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client` *(Important: Point this to the client subdirectory)*
5. Expand the **Environment Variables** section and add the variables from your local `client/.env` file:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
   - `VITE_API_URL` ➡️ Set this to your **Render Backend URL** (e.g. `https://placement-tracker-backend.onrender.com`)
6. Click **Deploy**.
7. Vercel will build the app and provide you with a secure public address (e.g., `https://placement-tracker.vercel.app`).

---

## 📱 Part 3: Accessing from Mobile & Multi-Device Sync

1. Open your Vercel URL on your mobile phone's browser (Safari or Chrome).
2. Click the browser's share icon and select **Add to Home Screen**.
3. This installs the application as a standalone **Progressive Web App (PWA)** on your mobile.
4. Sign in with the exact same Google Account you use on your computer.
5. All your checklists, problem logs, resource library uploads, and timers will sync in real-time across both devices immediately!
