# Dynamic Portfolio Dashboard - Setup Guide

This guide explains how to set up, run, and build the **Dynamic Portfolio Dashboard** on your local machine.

## Prerequisites
- **Node.js**: Version 18.17.0 or higher.
- **npm**: Installed with Node.js.

---

## 1. Installation

1.  **Unzip / Open the Project Folder**:
    Navigate to the project directory in your terminal.
    ```bash
    cd portfolio-dashboard
    ```

2.  **Install Dependencies**:
    Run the following command to install all required packages (Next.js, React, Tailwind, Yahoo Finance, etc.):
    ```bash
    npm install
    ```

---

## 2. Running the Development Server

To start the dashboard locally with hot-reloading enabled:

```bash
npm run dev
```

- The server will start at: `http://localhost:3000`
- Open this URL in your browser.
- The dashboard will automatically fetch fresh data every 15 seconds.

---

## 3. Data Management

- **Portfolio Data**: The raw Excel file is located at `data/E555815F_58D029050B.xlsx`.
- **JSON Generation**: The app uses `data/portfolio.json`. If you update the Excel file, regenerate the JSON by running:
    ```bash
    node scripts/generate-portfolio.js
    ```

---

## 4. Building for Production

If you want to create an optimized production build (simulating a deployed environment):

1.  **Build**:
    ```bash
    npm run build
    ```
2.  **Start**:
    ```bash
    npm start
    ```

---



## Folder Structure Overview

- **`app/`**: Main application code (Pages, API Routes).
- **`components/`**: UI Components (PortfolioTable).
- **`lib/`**: Backend logic (`stock-service.ts`) and Yahoo Client (`yahoo-client.ts`).
- **`data/`**: Excel source file and generated JSON.
- **`scripts/`**: Utility scripts for data parsing.
# Dynamic-Portfolio-Dashboard
