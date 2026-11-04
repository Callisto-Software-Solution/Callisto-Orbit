# Callisto-Orbit 🚀
> **Internal Team Fund & Monthly Collection Pool Management System**  
> Built for **Callisto (Cyber Security & AI)**

---

## 🌟 Overview
**Callisto-Orbit** is a high-tech, responsive web application engineered to manage and monitor a monthly team collection fund for 6 core team members. 
- **Squad Size**: 6 Members
- **Monthly Contribution**: $100 per member
- **Monthly Target**: $600 / month
- **Purpose**: Future venture capital, operations, and growth reserve for Callisto Cyber Security & AI.

---

## 🎨 Design & Aesthetic
- **Callisto Brand Theme**: Fiery cyber-orange (`#ff5500`), flame red (`#e62020`), circuit lines, and the official Callisto Phoenix Shield.
- **Glassmorphism UI**: Inspired by sleek cyber-command centers — frosted glass backdrop (`backdrop-filter: blur(20px)`), subtle neon orange borders, glowing stats, and clean status indicators.
- **Mobile First & Fully Responsive**: Optimized for smartphones, tablets, laptops, and desktop displays.

---

## ⚙️ Tech Stack & Architecture
- **Frontend**: HTML5, CSS3, Bootstrap 5.3, Bootstrap Icons, Google Fonts (`Inter` & `Rajdhani`).
- **Backend**: Node.js REST server (`server.js`) with zero external runtime dependencies.
- **Data Persistence**: **Pure JSON File Storage** (`data/users.json`, `data/collections.json`, `data/config.json`) with atomic write protection. **No SQL or NoSQL database server needed!**
- **Security**: 
  - Password hashing: Cryptographic `scrypt` 256-bit with unique random salt.
  - Session management: Tamper-proof HMAC-SHA256 tokens stored in secure `HttpOnly` cookies.
- **CI/CD**: GitHub Actions workflow (`.github/workflows/ci.yml`) matrix-testing across Node 18, 20, and 22.

---

## 👥 Default Team Members & Credentials

Default testing password for all squad members: `callisto123`

| Member | Username | Email | Role | Title |
| :--- | :--- | :--- | :--- | :--- |
| **Kehan Hasalaka** | `kehan` | `kehan@callisto.io` | **Admin** | Lead & Founder |
| **Alex Chen** | `alex` | `alex@callisto.io` | Member | AI & ML Specialist |
| **Nimesha Perera** | `nimesha` | `nimesha@callisto.io` | Member | Cyber Security Engineer |
| **Sarah Miller** | `sarah` | `sarah@callisto.io` | Member | Cloud Infrastructure |
| **Dinuka Fernando** | `dinuka` | `dinuka@callisto.io` | Member | Full-Stack Dev |
| **Kavindu Silva** | `kavindu` | `kavindu@callisto.io` | Member | Security Analyst |

*(The login screen features 1-Click quick test buttons to easily switch and test between all 6 squad members!)*

---

## 🚀 Quick Start

### 1. Run the Application
```bash
npm start
```
Or directly with Node:
```bash
node server.js
```
The server will start at:
👉 **http://localhost:3000**

### 2. Run Automated Tests
```bash
npm test
```

---

## 📂 Project Structure
```text
Callisto-Orbit/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI/CD pipeline
├── data/
│   ├── config.json            # Pool configurations ($100/mo, 6 members)
│   ├── collections.json       # Monthly contribution records & payment states
│   └── users.json             # 6 team member accounts & salted password hashes
├── public/
│   ├── assets/
│   │   ├── css/
│   │   │   └── style.css      # Callisto cyber-orange + glassmorphism stylesheet
│   │   ├── images/
│   │   │   └── callisto-logo.jpg # Callisto brand logo
│   │   └── js/
│   │       ├── auth.js        # Login logic, validation & quick-fill buttons
│   │       └── dashboard.js   # Dashboard metrics, collection state & logout
│   ├── index.html             # Login view (Mobile responsive, glassmorphic)
│   └── dashboard.html         # Fund overview dashboard
├── test/
│   └── test.js                # In-memory test suite for CI & local validation
├── server.js                  # Native HTTP REST API & static file server
├── package.json
└── README.md
```

---

## 🔒 License
MIT License &copy; 2026 Callisto Cyber Security & AI. All rights reserved.
