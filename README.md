# Callisto-Orbit 🚀
> **Internal Team Fund & Monthly Collection Pool Management System**  
> Built for **Callisto Cyber Security & AI**

[![Callisto-Orbit CI/CD](https://github.com/Callisto-Software-Solution/Callisto-Orbit/actions/workflows/ci.yml/badge.svg)](https://github.com/Callisto-Software-Solution/Callisto-Orbit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%20%7C%2020%20%7C%2022-brightgreen.svg)](https://nodejs.org)
[![Zero-DB](https://img.shields.io/badge/Database-Zero--DB%20(Pure%20JSON)-cyan.svg)](#-zero-db-architecture)
[![Render Auto-Deploy](https://img.shields.io/badge/Deploy-Render%20Auto--Deploy-blueviolet.svg)](#-render-cloud-auto-deployment)

---

## 🌟 Overview
**Callisto-Orbit** is a high-tech, responsive web application engineered to manage and monitor a monthly team collection fund for the core specialists of Callisto Cyber Security & AI.
- **Squad Size**: 6 Core Specialists (Dynamically expandable via Admin Console)
- **Monthly Contribution**: $100 per specialist
- **Monthly Target**: $600 / month (Auto-scales with roster size)
- **Purpose**: Future venture capital, security infrastructure, operations, and growth reserve for Callisto.

---

## ✨ Key Features & Capabilities

### 1. 🛡️ Three-Tier Role Hierarchy (Clearance Tiers)
| Clearance Tier | Specialist | Credentials | Permissions |
| :--- | :--- | :--- | :--- |
| **`super_admin`** | **Kehan Hasalawa** (Founder & Lead) | NIC: `200213800593`<br>Password: `callisto123` | Full Zero-DB ledger control, register specialists across all tiers (Member, Admin, Super Admin), edit NICs, adjust fund targets. |
| **`admin`** | **Alex Chen** (AI & ML) | NIC: `199812345671`<br>Password: `callisto123` | Squad administration, register new specialists with Member/Admin clearance, modify records. |
| **`member`** | Nimesha, Sarah, Dinuka, Kavindu | Registered NIC only | Single-field instant password-free clearance login. View fund progress and personal payments. |

### 2. 🔐 Dual-Mode Operator Clearance Portal (`/login.html`)
- **Member Access (NIC)**: Single input field for instant vault access via registered 9-digit or 12-digit NIC.
- **Admin & Super Admin Mode**: Elevated console verification using Admin NIC and master security password.
- **High-Contrast Design**: Crisp, readable inputs with tailored placeholders (`#94a3b8`).
- **Tactile Cyber Audio**: Synthesized mechanical clicks on mouse actions and mechanical keystrokes on typing via the Web Audio API.
- **Animated Phoenix Stage**: Live canvas ember particles and dynamic Phoenix wing glow.

### 3. 📊 High-Tech Command Dashboard (`/dashboard.html`)
- **Cyber Glassmorphism Sidebar**:
  - Sticky left sidebar on desktop & responsive offcanvas slide-out drawer on mobile screens.
  - Active specialist identity card with live glowing clearance badge (`★ SUPER ADMIN`, `⚡ ADMIN`, `● MEMBER`).
  - Smooth-scrolling navigation menu (`Overview & Metrics`, `Monthly Pool`, `Vault History`, `Zero-DB Info`).
  - Real-time squad target progress tracker (`66.7%` completion indicator).
- **Specialist Registry & NIC Console** *(Admin / Super Admin only)*:
  - Register new squad members with their NIC number directly from the dashboard.
  - Newly registered operators can immediately authenticate with their NIC.
  - Live editing of existing specialist NICs, titles, and clearance roles.

---

## ⚙️ Zero-DB Architecture
Callisto-Orbit operates on a high-integrity, atomic **Zero-DB JSON Engine**:
- **`data/users.json`**: Squad accounts, cryptographic `scrypt` 256-bit password hashes, NICs, and clearance roles.
- **`data/collections.json`**: Month-by-month contribution records, transaction references, and payment statuses.
- **`data/config.json`**: Dynamic system parameters, currency, per-member quota, and active pool targets.
- **Security**: Tamper-proof HMAC-SHA256 session tokens stored in secure `HttpOnly` cookies.
- **Zero Third-Party Database Dependencies**: No MySQL, PostgreSQL, MongoDB, or external database server required.

---

## 👥 Default Specialists & Credentials

Default testing password for Admin access: `callisto123`

| Specialist | Username | Registered NIC | Role | Title |
| :--- | :--- | :--- | :--- | :--- |
| **Kehan Hasalawa** | `kehan` | `200213800593` | `super_admin` | Lead & Founder |
| **Alex Chen** | `alex` | `199812345671` | `admin` | AI & ML Specialist |
| **Nimesha Perera** | `nimesha` | `199912345672` | `member` | Cyber Security Engineer |
| **Sarah Miller** | `sarah` | `199712345673` | `member` | Cloud Infrastructure |
| **Dinuka Fernando** | `dinuka` | `200212345674` | `member` | Full-Stack Dev |
| **Kavindu Silva** | `kavindu` | `200112345675` | `member` | Security Analyst |

---

## 🚀 Quick Start

### 1. Clone & Run Locally
```bash
# Clone the repository
git clone https://github.com/Callisto-Software-Solution/Callisto-Orbit.git
cd Callisto-Orbit

# Start the Node.js server
npm start
```
The command center will be available at:  
👉 **http://localhost:3000**

### 2. Run Automated Test Suite
```bash
npm test
```
Runs 13 end-to-end automated tests verifying JSON persistence, scrypt cryptography, HMAC tokens, single-field NIC login, role enforcement, and member registration endpoints.

---

## 🌐 Render Cloud Auto-Deployment

This repository is pre-configured with **`render.yaml`** for automatic cloud deployment on [Render.com](https://render.com):

1. Sign in to [Render.com](https://render.com) using your GitHub account.
2. Click **New +** ➔ **Blueprint** (or **Web Service**).
3. Connect the repository **`Callisto-Software-Solution/Callisto-Orbit`**.
4. Render automatically parses `render.yaml` and deploys the Node.js application.
5. **Auto-Deploy**: Every `git push origin main` automatically triggers a zero-downtime production deployment!

---

## 📂 Project Directory Structure

```text
Callisto-Orbit/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions matrix CI/CD pipeline
├── data/
│   ├── config.json            # Dynamic pool config (Target, per-member quota)
│   ├── collections.json       # Historical & active contribution records
│   └── users.json             # Squad credentials, roles, and NIC vault
├── public/
│   ├── assets/
│   │   ├── css/
│   │   │   └── style.css      # Callisto cyber-orange, fire theme & glassmorphism
│   │   ├── images/
│   │   │   ├── callisto-logo.jpg      # Official brand logo
│   │   │   └── callisto-phoenix.jpg   # Brand artwork
│   │   └── js/
│   │       ├── auth.js        # Multi-mode NIC clearance & Admin login handler
│   │       ├── dashboard.js   # Metrics, sidebar state & specialist management
│   │       ├── phoenix.js     # Live fire embers & canvas animations
│   │       └── portal-loader.js # Seamless portal transition & tactile audio
│   ├── index.html             # Landing Phoenix presentation view
│   ├── login.html             # Operator clearance portal (NIC / Admin)
│   └── dashboard.html         # Command center with sidebar & admin console
├── test/
│   └── test.js                # 13-step comprehensive automated test suite
├── render.yaml                # Render cloud blueprint specification
├── server.js                  # Native HTTP REST API & static server
├── package.json               # Node.js manifest & npm scripts
├── LICENSE                    # MIT Open Source License
└── README.md                  # Project documentation
```

---

## 🔒 License
This project is open-source and licensed under the **[MIT License](LICENSE)**.  
&copy; 2026 **Callisto Cyber Security & AI**. All rights reserved.
