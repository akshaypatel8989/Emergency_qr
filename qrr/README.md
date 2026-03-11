# 🚨 Emergency Safety QRR — Full Stack Application

A complete vehicle emergency QR system — users register their vehicle, get a QR code sticker, and anyone who scans it can instantly contact emergency contacts during an accident.

---

## 📁 Project Structure

```
emergency-safety-qrr/
├── backend/          ← Express + MongoDB API
│   ├── server.js
│   ├── .env
│   ├── middleware/auth.js
│   ├── models/       (User, Order, QRRecord, Wallet, Referral, Withdrawal)
│   └── routes/       (auth, orders, scan, wallet, dealer, admin)
└── frontend/         ← React + Vite + TypeScript
    ├── src/
    │   ├── App.tsx          (routes)
    │   ├── main.tsx
    │   ├── index.css        (global styles + design tokens)
    │   ├── lib/             (api.ts, qr-generator.ts, utils.ts)
    │   ├── hooks/           (use-auth.ts, use-toast.ts)
    │   ├── components/      (Header, Footer, ui/*)
    │   └── pages/           (all 18 pages)
    └── .env
```

---

## 🚀 Setup & Run

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend Setup
```bash
cd backend
npm install
# Edit .env — set your MONGO_URI and JWT_SECRET
npm run dev          # starts on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# .env is pre-configured for localhost:5000
npm run dev          # starts on http://localhost:5173
```

---

## 🔑 Environment Variables

### backend/.env
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/emergency_qrr
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:5173
```

### frontend/.env
```
VITE_API_URL=http://localhost:5000
VITE_SITE_URL=http://localhost:5173
```

---

## 📱 Pages & Features

| Page              | URL                     | Auth     | Description                              |
|-------------------|-------------------------|----------|------------------------------------------|
| Landing           | `/`                     | No       | Hero, features, pricing, how it works    |
| Auth              | `/auth`                 | No       | Login + Signup tabs                      |
| Register          | `/register`             | Yes      | 3-step: category → plan → details form  |
| Payment           | `/payment`              | Yes      | Order summary + simulated payment        |
| Order Success     | `/order-success/:id`    | Yes      | QR download (digital) or pending status  |
| My Orders         | `/my-orders`            | Yes      | All orders + QR download buttons         |
| Wallet            | `/wallet`               | Yes      | Balance, referrals, withdrawals          |
| Scan              | `/scan/:qrId`           | **No**   | Emergency info + WhatsApp/Call/Location  |
| Dealer Login      | `/dealer-login`         | No       | Dealer auth page                         |
| Dealer Dashboard  | `/dealer-dashboard`     | Dealer   | Create QR orders for customers           |
| Admin Dashboard   | `/admin-dashboard`      | Admin    | Orders, users, withdrawals management    |
| Profile           | `/profile`              | Yes      | Edit profile + change password           |
| About/Contact     | `/about`, `/contact`    | No       | Static info pages                        |
| Privacy/Terms     | `/privacy`, `/terms`    | No       | Legal pages                              |

---

## 🛣️ API Endpoints

### Auth
```
POST /api/auth/signup         — Register new user
POST /api/auth/login          — Login
GET  /api/auth/me             — Get current user (auth)
PUT  /api/auth/profile        — Update name/phone (auth)
PUT  /api/auth/change-password — Change password (auth)
```

### Orders
```
POST /api/orders              — Create order
PUT  /api/orders/:id/pay      — Mark paid, generate QR
GET  /api/orders/with-qr      — User's orders + QRs
GET  /api/orders/:id          — Single order + QR
```

### Scan (Public)
```
GET  /api/scan/:qrId          — Get emergency info (NO auth)
```

### Wallet
```
GET  /api/wallet              — Balance + referrals + withdrawals
POST /api/wallet/withdraw     — Request withdrawal
```

### Dealer
```
GET  /api/dealer/orders       — Dealer's orders
POST /api/dealer/orders       — Create QR for customer
```

### Admin
```
GET  /api/admin/stats                   — Dashboard stats
GET  /api/admin/orders                  — All orders
PUT  /api/admin/orders/:id/status       — Update order status
GET  /api/admin/users                   — All users
PUT  /api/admin/users/:id/role          — Change user role
GET  /api/admin/withdrawals             — All withdrawals
PUT  /api/admin/withdrawals/:id/status  — Approve/reject
GET  /api/admin/qr-records              — All QR codes
```

---

## 🎯 Plans

| Plan    | Type     | Price | Delivery        |
|---------|----------|-------|-----------------|
| General | Digital  | ₹50   | Instant QR      |
| Silver  | Physical | ₹199  | Sticker shipped |
| Gold    | Physical | ₹499  | Premium sticker |

---

## 💰 Referral System

- Every user gets a unique referral code
- When someone uses your referral code and pays → you earn ₹50
- Withdraw when balance reaches ₹100+
- 20% platform fee on withdrawals

---

## 👤 User Roles

| Role   | Access                                    |
|--------|-------------------------------------------|
| user   | Register, buy QR, wallet, my orders       |
| dealer | All above + dealer dashboard + bulk QR    |
| admin  | Everything + admin dashboard              |

To make someone admin, manually update MongoDB:
```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

---

## 🔒 QR Privacy

- The scan page only shows: vehicle number, vehicle type, blood group, city/state
- Owner's full name and address are **never** shown publicly
- Phone numbers are not shown — only call/WhatsApp buttons
- QR scan count is tracked for analytics

---

## 🎨 Design

- **Fonts**: Rajdhani (headings) + DM Sans (body)
- **Colors**: Emergency red (#dc2626) primary
- **Theme**: Light with dark footer
- **Components**: Custom shadcn-style radix UI components
