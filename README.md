# GoPharma - Verified Healthcare at Your Fingertips

GoPharma is a modern, AI-driven healthcare ecosystem designed to solve the "Broken System" of medicine procurement in Ilorin, Kwara State. By bridging the gap between local manufacturers, licensed pharmacies, and patients, we ensure authentic medication is accessible in seconds and delivered in minutes.

## 🚀 The Problem We Solve
In many regions, patients face:

* **Blind Searches**: Wandering from pharmacy to pharmacy searching for specific meds.
* **Counterfeit Risk**: Lack of transparency in the drug supply chain.
* **Inefficiency**: Hours wasted in queues for basic healthcare needs.

## ✨ Our Solutions
GoPharma provides a three-way fulfillment model designed for maximum user-friendliness:

* **Find in Seconds**: A powerful search engine with Voice and Image recognition to scan live inventory across verified pharmacies in Ilorin (Tanke, GRA, Basin, etc.).
* **QR Pre-Order**: Secure your medication online and receive a unique QR Code. Walk into the pharmacy, scan, and collect instantly—no more queues.
* **15-Minute Delivery**: A dedicated logistics network of riders ensuring your verified meds reach your doorstep in under 15 minutes.

## 🛠️ Technical Stack
* **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
* **Icons**: Lucide React
* **Backend/Database**: Firebase Firestore
* **Authentication**: Firebase Auth (Google & Apple One-Tap Sign-in)
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
* A Firebase Project
* Google/Apple Developer accounts (for Auth)

### Installation
Clone the repository:
```bash
git clone https://github.com/your-username/gopharma.git
cd gopharma
```

Install dependencies:
```bash
npm install
```

Set up your environment variables (`.env.local`):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
```

Run the development server:
```bash
npm run dev
```

Open http://localhost:3000 to see the result.

## 🌍 Impact
GoPharma isn't just an app; it's a "Go-To" health assistant for:

* Students in Tanke needing fast, affordable medication.
* Families in GRA requiring verified, high-trust healthcare.
* Rural populations gaining access to city-wide pharmacy inventories via simple AI interfaces.

## 🛡️ License
Distributed under the MIT License. See LICENSE for more information.

Developed with ❤️ for the Ilorin Community.
