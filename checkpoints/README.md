# 💼 GeniePay – Online Crypto Payroll Service

<p align="center">
  <a href="#">
    <img src="https://img.shields.io/badge/Built%20with-Wagmi-purple" alt="Built with Wagmi/Viem" height="24">
    <img src="https://img.shields.io/badge/Powered%20by-Ethereum-3c3c3d" alt="Powered by Ethereum" height="24">
    <img src="https://img.shields.io/badge/Smart%20Contracts-Hardhat-yellow" alt="Hardhat" height="24">
    <img src="https://img.shields.io/badge/Frontend-React-blue" alt="React" height="24">
    <img src="https://img.shields.io/badge/Web3%20Wallet-MetaMask-f6851b" alt="MetaMask" height="24">
    <img src="https://img.shields.io/badge/Network-Sepolia%20Testnet-5c4ee5" alt="Ethereum Testnet" height="24">
  </a>
</p>

## 1️⃣ Overview

**GeniePay** is a crypto-based payroll platform that lets businesses pay employees and contractors globally using any kind of cryptocurrency, while staying **tax and compliance ready**. And what differenciates us from the rest is that we're entirely free, you don't even need an account to use us!  

**Our goals:** Remove the **cost, delays, and friction** of international payments and managing your team.  

---

## 2️⃣ Why GeniePay?

### **The Problem**
- International payroll is **slow**, **expensive**, and **complicated**.
- Fees can be **6%+** and delays up to **5 days**.
- Most crypto payroll solutions ignore tax/legal compliance.
- Most of these companies need you to pay or even schedule an appointement with them before use

### **The Solution**
GeniePay enables:
- **Instant** cryptocurrency payouts
- **Automated** tax & compliance handling
- **Entirely** free and no accounts needed
  
---

## 3️⃣ Core Features

- **Send** 1000 employee payouts in a single click using smart contracts
- **Easy** big team management with CSV files
- **Employer Dashboard** for managing teams and payouts
- **Multi-Currency Support** (Stablecoins + Fiat)

---

## 4️⃣ MVP Roadmap

| Phase | Goal | Key Actions |
|-------|------|-------------|
| [**1**](https://www.youtube.com/watch?v=w4mI5J88Kbg) | Basic wallet-to-wallet payment | ✅ Connect wallet via MetaMask<br>✅ Send USDC/ETH to employee wallets<br>✅ Add employees in dashboard<br>✅ Display wallet balance |
| [**2**](https://www.youtube.com/watch?v=srOUt_pADQg) | New Website UI & Environment Setup | 🛠️ Implement new website UI<br>🛠️ Start flow diagrams<br>🛠️ Create new company logo<br>🛠️ Setup separate test & production environments<br>🛠️ Implement new wallet connection using RainbowKit UI |
| **3** | Prepare for Public Deployment | 🔄 Support account & no-account workflows<br>🔄 Implement all required pages |
| **3.5** | Blockchain dev | 🔄 Implement mass payouts via smart contracts<br>🔄 Settings to switch between USD, CAD, ETH, or other crypto<br>
| **4** | Touch-up & Security | 🛡 Security review<br>🛡 Finish flow diagrams/documentation<br>🛡 Improve website graphic design<br>🧾 Generate professional invoices and accountant-friendly files after transactions |
| **5** | Product Presentation | 📄 Prepare product for demos |

---

## 5️⃣ Tech Stack

### **Frontend**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS

### **Web3 Integration**
- Wagmi 2.x (Ethereum hooks)
- Viem (TS-first Ethereum library)
- RainbowKit (wallet connection UI)
- React Query (@tanstack/react-query)

### **Blockchain**
- Sepolia Testnet
- MetaMask
- Test USDC / DAI

### **UI & State**
- Lucide React (icons)
- Headless UI *(optional)*
- React Hook Form
- Local React state + Wagmi hooks

### **Dev Tools**
- ESLint + Prettier
- TypeScript
- GitHub (deployment & CI/CD)

---

## 6️⃣ Architecture (High Level)
```
+----------------------+
| Employer Dashboard   |
+----------------------+
            |
            v
+----------------------+
| Compliance Layer     | <-- Tax rules, KYC, AML
+----------------------+
            |
            v
+----------------------+
| Smart Contracts      | <-- Payroll logic (stablecoin releases)
+----------------------+
            |
            v
+----------------------+
| Payment Processor    | <-- Executes on-chain transactions
+----------------------+
            |
            v
+----------------------+
| Employee Wallets     | <-- Custodial/Non-Custodial options
+----------------------+
            |
            v
+----------------------+
| Fiat On/Off Ramps    | <-- Circle, Transak, local banks
+----------------------+
```

---

## 7️⃣ Post-Payment Documents for Employers

After each payroll run, the employer should have:
1. **Payment Receipts** (per employee)
   - Employee name, wallet, amount, token, USD equivalent, tx hash, timestamp, gas fees
2. **Batch Payroll Summary**
   - All employees in the run, totals, fees, status
3. **Reconciliation Report**
   - Total sent vs. remaining balance, accounting match
4. **Audit/Compliance Exports**
   - PDF, CSV/XLSX, JSON formats

---

## 8️⃣ Business Model

| Revenue Stream          | Description |
|-------------------------|-------------|
| SaaS Licensing          | Monthly fee per employee |
| Conversion Fees         | Crypto ↔ Fiat spread |
| Compliance-as-a-Service | Compliance engine for 3rd parties |
| API Licensing           | Payroll API integrations |
