# 🌿 CareNest — Home & Plant Care Platform

> A full-stack MERN (MongoDB, Express, React, Node.js) web application that connects homeowners with geolocation-verified caretakers for plant watering, pet feeding, mail pick-up, and home safety checks.

[![Live Demo](https://img.shields.io/badge/Live--Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://care-nest-psi.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend--API-Render-46E3B7?style=for-the-badge&logo=render)](https://carenest-backend-4828.onrender.com/health)

---

## 🌟 Live Links

* 🌐 **Frontend (Vercel)**: [https://care-nest-psi.vercel.app](https://care-nest-psi.vercel.app)
* ⚙️ **Backend API (Render)**: [https://carenest-backend-4828.onrender.com/health](https://carenest-backend-4828.onrender.com/health)
* 📦 **GitHub Repository**: [https://github.com/deekshi-prog/CareNest.git](https://github.com/deekshi-prog/CareNest.git)

---

## ✨ Key Features

### 📍 1. Geospatial Proximity Matching
* Powered by MongoDB 2DSphere indexing (`$nearSphere` / `$geoNear`).
* Calculates exact distance in kilometers between homeowners and caretakers in the **Vijayawada, India** region.
* Dynamic filtering by radius (5km to 50km), hourly rate, ratings, and specific service categories.

### 📸 2. Photo Visit Verification & Task Tracking
* Caretakers check in, complete custom task checklists (watering indoor plants, feeding pets, collecting mail), and upload live photo proof.
* Automated timestamp and EXIF metadata verification for tamper-proof visit logs.

### 🛡️ 3. Admin Verification & Dispute Resolution
* Comprehensive Admin Dashboard to audit new caretaker credentials before public listing.
* Built-in dispute resolution, booking metrics tracking, and refund processing handlers.

### ⚡ 4. Asynchronous Background Job Queue
* Decoupled worker queue processes notification tasks and status updates asynchronously in the background.
* Guarantees zero latency on HTTP API responses (< 100ms response time).

### 🎨 5. Premium Glassmorphic UI & Theme Toggle
* Custom modern design system built with CSS variables, sleek glassmorphism, dynamic micro-animations (Framer Motion), and a persistent **Dark/Light Mode** toggle.

---

## 🏗️ System Architecture

```text
[ Client Browser ]
        │
        ▼ (HTTPS / JSON)
[ React Single Page App ]  ──(Vercel Hosting)
        │
        ▼ (REST API Requests)
[ Express / Node.js API ]  ──(Render Web Service)
        │
        ├──► [ JWT Auth & Middleware ]
        ├──► [ Asynchronous Job Queue Worker ]
        │
        ▼ (Mongoose ODM)
[ MongoDB Atlas Cloud Database ]  ──(2DSphere Spatial Indexing)
```

---

## 🛠️ Technology Stack

| Layer | Technologies & Tools Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router DOM, Framer Motion, Vanilla CSS (Design Tokens) |
| **Backend** | Node.js, Express.js, JWT Authentication, BcryptJS, Multer, Nodemailer |
| **Database** | MongoDB Atlas, Mongoose ODM (2DSphere Geospatial Indexing) |
| **Deployment** | Vercel (Frontend SPA), Render (Backend Web Service), UptimeRobot (24/7 Monitoring) |

---

## 📁 Directory & Folder Structure

```text
CareNest/
├── frontend/                   # React Single Page Application (Vite)
│   ├── src/
│   │   ├── components/        # Navbar, Footer, CaretakerCards, Modals
│   │   ├── context/           # AuthContext, ThemeContext
│   │   ├── pages/             # Home, Explore, Login, Register, Bookings, Admin
│   │   ├── services/          # api.js (Axios / Fetch wrapper)
│   │   └── App.jsx            # Application Router & Providers
│   └── vercel.json            # Vercel SPA route rewrite rules
│
├── backend/                    # Express Node.js REST API
│   ├── src/
│   │   ├── config/            # db.js (MongoDB Atlas & DNS config)
│   │   ├── controllers/       # auth, assistant, booking, admin controllers
│   │   ├── middleware/        # auth, error handling, file upload
│   │   ├── models/            # User, Profile, Booking, Review, Job
│   │   ├── routes/            # Express endpoint routers
│   │   ├── utils/             # seeder.js, jobQueue.js, mailer.js
│   │   └── server.js          # Main Express server entry point
│   └── package.json
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **MongoDB**: Local instance or MongoDB Atlas Connection URI

### 1. Clone the Repository
```bash
git clone https://github.com/deekshi-prog/CareNest.git
cd CareNest
```

### 2. Configure Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGODB_URI=mongodb+srv://flora_user:flora_password@cluster0.96o1pmf.mongodb.net/flora_assist?retryWrites=true&w=majority
JWT_SECRET=supersecretjwtkey123
```
Seed 20 Vijayawada caretakers into the database:
```bash
node src/utils/seeder.js
```
Start the backend server:
```bash
npm run dev
```

### 3. Configure Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 👩‍💻 Author & Acknowledgements

* **Developed by**: Deekshitha Kotha ([@deekshi-prog](https://github.com/deekshi-prog))
