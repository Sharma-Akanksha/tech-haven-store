<img width="1871" height="878" alt="Screenshot 2026-01-29 183718" src="https://github.com/user-attachments/assets/077914dc-0cfe-4c11-826d-a13447379aaa" /># 🛒 Tech Haven Store - E-commerce Demo

A fully functional React e-commerce store with intelligent coupon system where **every nth order unlocks a 10% discount** for the next qualifying order.

https://github.com/user-attachments/assets/7a8f8d5f-9c0a-4f8d-9b5a-3e8c8e3d3b3a

## ✨ Key Features
- **Smart Coupon System**: 
  - Auto-generates 10% discount coupon *before* every nth order (configurable)
  - Case-insensitive validation with real-time feedback
  - Discount auto-recalculates when cart changes after applying coupon
- **Complete Admin Dashboard**:
  - Order statistics (revenue, items sold, discount tracking)
  - Coupon history with usage status
  - Manual coupon generation for testing
- **Polished UI/UX**:
  - Responsive product grid with hover animations
  - Intuitive cart workflow with quantity controls
  - Clear success/error messaging
  - Professional color scheme with Tailwind CSS
- **Zero Backend Required**: All state managed in-memory

## 🛠️ Tech Stack
| Technology | Purpose |
|------------|---------|
| React 18 | Core UI framework |
| Vite | Blazing fast build tool |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Smooth animations |
| In-memory state | No backend needed |

## 🚦 Setup Instructions
```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/tech-haven-store.git
cd tech-haven-store

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Open http://localhost:5173
```

## 🔑 Coupon System Logic
```javascript
const NTH_ORDER = 5; // Configurable in src/App.jsx
```
1. After completing order #4 → Coupon `SAVE5NOW` auto-generates  
2. During order #5 checkout → Enter coupon for 10% off  
3. Discount **auto-updates** if cart changes after applying  
4. After order #5 completes → Coupon marked "used"  
5. After order #9 → New coupon `SAVE10NOW` generates for order #10

<img width="485" height="808" alt="Screenshot 2026-01-29 183848" src="https://github.com/user-attachments/assets/a44e3d86-af04-4fec-a413-4d965cce052f" />
<img width="524" height="857" alt="Screenshot 2026-01-29 183830" src="https://github.com/user-attachments/assets/3c534c7f-000d-46c1-8713-1303a49f3971" />
<img width="1876" height="598" alt="Screenshot 2026-01-29 183815" src="https://github.com/user-attachments/assets/bdb7fe40-e2b9-427d-ac3a-8361c98cc4f3" />
<img width="1837" height="843" alt="Screenshot 2026-01-29 183755" src="https://github.com/user-attachments/assets/d31a4a26-0f61-4ceb-b0ad-f8c995dbf9a4" />
<img width="1471" height="938" alt="Screenshot 2026-01-29 183735" src="https://github.com/user-attachments/assets/befc7d66-f1b8-43a5-aa24-9e557382d3da" />


## 📂 Project Structure

```
tech-haven-store/
├── src/
│   ├── App.jsx          # Complete app logic (coupon system, cart, admin)
│   ├── main.jsx         # React entry point
│   └── index.css        # Tailwind imports + global styles
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
├── .gitignore
└── README.md
```

## 🌟 Why This Implementation Stands Out
| Requirement | Implementation |
|-------------|----------------|
| Coupon for nth order | Generated *after* (n-1)th order → available *during* nth order checkout |
| Auto-recalculation | `useEffect` tracks cart changes when coupon is active |
| Case-insensitive | All comparisons use `.toUpperCase()` |
| Error handling | Messages only appear *after* "Apply" click |
| Admin visibility | Clear status labels ("Valid for order #5") |
| State reset | Full cleanup after checkout |

## 📸 Preview
![Admin Panel](https://via.placeholder.com/800x400/1e293b/64748b?text=Admin+Dashboard+Preview)  
*Admin panel showing order statistics and active coupon*

![Cart Flow](https://via.placeholder.com/800x400/f1f5f9/475569?text=Cart+with+Auto-Recalculating+Discount)  
*Cart with real-time discount updates*

## 📜 License
MIT © Akanksha Sharma
EOF
