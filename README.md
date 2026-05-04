# Pharma-E - Verified Healthcare at Your Fingertips

Pharma-E is a modern, AI-driven healthcare ecosystem designed to solve the "Broken System" of medicine procurement in Ilorin, Kwara State. By bridging the gap between local manufacturers, licensed pharmacies, and patients, we ensure authentic medication is accessible in seconds and delivered in minutes.

## 🚀 The Problem We Solve
In many regions, patients face:

* **Blind Searches**: Wandering from pharmacy to pharmacy searching for specific meds.
* **Counterfeit Risk**: Lack of transparency in the drug supply chain.
* **Inefficiency**: Hours wasted in queues for basic healthcare needs.

## ✨ Our Solutions
Pharma-E provides a three-way fulfillment model designed for maximum user-friendliness:

* **Find in Seconds**: A powerful search engine with Voice and Image recognition to scan live inventory across verified pharmacies in Ilorin (Tanke, GRA, Basin, etc.).
* **QR Pre-Order**: Secure your medication online and receive a unique QR Code. Walk into the pharmacy, scan, and collect instantly—no more queues.
* **15-Minute Delivery**: A dedicated logistics network of riders ensuring your verified meds reach your doorstep in under 15 minutes.

## 🛠️ Technical Stack
* **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4
* **Icons**: Lucide React
* **Backend/Database**: Supabase (PostgreSQL, RLS)
* **Authentication**: Supabase Auth
* **Payment Gateways**: Interswitch, Monnify, Paystack
* **AI Integration**: Gemini API (for conversational search and prescription analysis)
* **Deployment**: Vercel

## 📱 Key Features
* **WhatsApp AI Bot**: A conversational interface for users who prefer chat-based ordering.
* **Live Coverage Tracker**: Real-time visibility into delivery speeds across Ilorin's major hubs.
* **Pharmacy Portal**: A dedicated dashboard for pharmacists to manage bulk orders and live inventory.
* **User-Centric FAQ**: An interactive, localized guide to building trust and answering common concerns.

## 🏁 Getting Started

### Prerequisites
* Node.js 18.x or higher
* A Supabase Project
* Gemini API Key

### Installation
Clone the repository:
```bash
git clone https://github.com/dexdivine9-source/Pharm-E-.git
cd gopharma
```

Install dependencies:
```bash
npm install
```

Set up your environment variables (`.env`):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Run the development server:
```bash
npm run dev
```

Open http://localhost:3000 to see the result.

## 🌍 Impact
Pharma-E isn't just an app; it's a "Go-To" health assistant for:

* Students in Tanke needing fast, affordable medication.
* Families in GRA requiring verified, high-trust healthcare.
* Rural populations gaining access to city-wide pharmacy inventories via simple AI interfaces.

## 🛡️ License
Distributed under the MIT License. See LICENSE for more information.

Developed with ❤️ for the Ilorin Community.
