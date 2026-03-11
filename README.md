# Counseling Management System (CMS)

A modern, highly secure, full-stack web application designed to facilitate connection and scheduling between students, faculty, and guidance counselors.

## 🚀 Features

### Role-Based Architecture
The system employs secure, strict role-based access control (RBAC) powered by Firebase Authentication and Firestore Security Rules:
- **Student Portal:** Students can submit walk-in or referral interview requests, view their status, and manage their profiles.
- **Faculty Portal:** Faculty members can refer students to the guidance office securely.
- **Admin Dashboard:** Administrators enjoy a comprehensive overview of campus-wide mental health metrics, displaying real-time demographics, pending session overviews, and action items without degrading performance.

### Enhanced Security Measures
Following a thorough "Vibe Coding" Security Audit, this project features:
- **Strict Schema Validation:** `firestore.rules` validate all incoming data payloads to guarantee schema integrity and prevent NoSQL injection.
- **Anti-Enumeration Login:** Login error responses intentionally mask specific Firebase Auth errors to prevent malicious actors from enumerating registered user emails.
- **Environment Isolation:** All Firebase API keys and secrets are cleanly abstracted out of source control using `.env.local` variables.

## 🛠️ Technology Stack

- **Frontend Core:** React 18, Vite
- **Styling:** Tailwind CSS, PrimeReact (for dynamic metric charting)
- **Routing:** React Router DOM (v6) with custom `<ProtectedRoute>` wrappers
- **Backend/BaaS:** Firebase (Authentication, Firestore Database)
- **Testing:** 
  - **Unit:** Vitest & React Testing Library (`jsdom` environment)
  - **End-to-End (E2E):** Playwright

## 📦 Setup & Installation

### 1. Requirements
- Node.js (v18+)
- A Firebase Project (with Firestore and Authentication [Email/Password] enabled)

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_FIREBASE_MEASUREMENT_ID="your-measurement-id"
```

### 4. Run Development Server
```bash
npm run dev
```

## 🧪 Testing

The CMS project implements a dual-layer testing pyramid.

**Run Unit Tests** (Vitest)
Executes rapid business-logic and utility tests (e.g., Auth Error Handlers):
```bash
npm test
```

**Run End-to-End Tests** (Playwright)
Executes full browser automation tests against critical UI flows (like the Landing Page initialization):
```bash
# Optional: Install browsers if running for the first time
npx playwright install --with-deps

npm run test:e2e
```

## 🛡️ License
Proprietary / Closed Source. All rights reserved.
