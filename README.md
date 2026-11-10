# Chitrakatha (ಚಿತ್ರಕಥಾ)

> **"A little story, delivered to your doorstep."**  
> **"ಒಂದು ಪುಟ್ಟ ಕಥೆ, ನಿಮ್ಮ ಮನೆ ಬಾಗಿಲಿಗೆ."**

Chitrakatha is a premium bilingual (Kannada + English) monthly creative stationery and story-letter subscription platform celebrating the timeless romance of slow mail, regional folklore, tactile craftsmanship, and archival paper art.

---

## ✦ Overview

In an era of vanishing digital notifications, Chitrakatha creates physical keepsakes:
* **Illustrated Story Letter**: Narrative letters on 120gsm textured cotton felt paper with natural deckle edges, weaving classic Kannada folklore and contemporary vignettes alongside poetic English translations.
* **Archival Art Cards**: Two collectible 300gsm heavyweight miniature art prints ready to frame.
* **Artisan Stickers**: Matte water-resistant die-cut botanical and architectural sheets.
* **Handcrafted Bookmark**: Letterpress printed on heavy board with authentic Kannada poetry quotes and silk/jute tassel.
* **Mini Creative Puzzle**: 24-piece linen-textured pocket jigsaw puzzle.
* **Colouring Sheets**: Heavy bleed-proof heritage architectural linework drawing sheets.

---

## ✦ Tech Stack

* **Framework**: Next.js 15 (App Router)
* **Library**: React 19
* **Language**: TypeScript (Strict Mode)
* **Styling**: Tailwind CSS with custom editorial design tokens
* **Icons**: Lucide React
* **Database**: MongoDB Atlas with Mongoose
* **Validation**: Zod
* **Payments**: Razorpay official Node SDK (one-time, test-mode ready)
* **Internationalization**: Custom client-side bilingual translation engine with persistence (Kannada & English)

---

## ✦ Project Architecture

```
├── .env.example                      # Environment configuration template
├── package.json                      # Dependency specifications
├── tsconfig.json                     # Strict TypeScript compiler configuration
├── tailwind.config.ts                # Warm paper & terracotta design tokens
├── next.config.ts                    # Next.js App Router configuration
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── health/route.ts       # Database & service health monitor
    │   │   └── editions/
    │   │       ├── route.ts          # Public catalog (active & upcoming editions)
    │   │       └── [slug]/route.ts   # Public single edition detail endpoint
    │   ├── globals.css               # Design tokens, typography & paper grain
    │   ├── layout.tsx                # Root layout with LanguageProvider, Announcement & Header
    │   └── page.tsx                  # Customer-facing homepage assembling all sections
    ├── components/
    │   ├── ui/                       # Button, Container, SectionHeading, Badge, Card, Accordion, Tabs
    │   ├── layout/                   # AnnouncementBar, Header, Footer, LanguageSwitcher
    │   └── home/                     # Hero, BrandStory, MonthlyCollections, WhatsInside, HowItWorks, SubscriptionPlans, Testimonials, FAQ
    ├── config/                       # Site metadata, routes, navigation & constants
    ├── data/                         # Collections, keepsakes, plans, FAQs, testimonials
    ├── i18n/                         # Dictionaries (en, kn) & LanguageProvider context
    ├── lib/                          # db.ts (Mongoose connection cache), rate-limit, api-response, validations, clients
    ├── models/                       # Mongoose schemas: User, Edition, Order, Subscription, Payment, PaymentWebhookEvent, Coupon, Shipment, Setting
    ├── services/                     # Edition, checkout, payment, admin (orders/coupons/shipments/subscriptions/settings)
    └── types/                        # Core TypeScript contracts and schemas
```

---

## ✦ Getting Started

### 1. Prerequisites
* Node.js v18+ (tested on Node.js v24)
* MongoDB Atlas cluster or local MongoDB instance

### 2. Environment Configuration
Copy `.env.example` to `.env.local` and add your database connection string:

```bash
cp .env.example .env.local
```

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/chitrakatha?retryWrites=true&w=majority
NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_SECRET=<at-least-32-random-characters>
ADMIN_EMAIL=admin@chitrakatha.art
ADMIN_NAME=Chitrakatha Administrator
ADMIN_PASSWORD=<strong-password-for-init:admin>
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

Create the first admin user after configuring the database:

```bash
npm run init:admin
```

### 3. Installation
```bash
npm install
```

### 4. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm start
```

### 6. Razorpay Test-Mode Payments
1. Create Razorpay **test mode** API keys in the dashboard.
2. Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` to `.env.local`.
3. Add a webhook with URL `{NEXT_PUBLIC_APP_URL}/api/payments/razorpay/webhook`.
4. Subscribe the webhook to `payment.captured`, `payment.authorized`, `payment.failed`, and `order.paid`.
5. For local webhook testing, expose `http://localhost:3000` using a tunnel such as ngrok and use the tunnel URL in `NEXT_PUBLIC_APP_URL`.

Payment amounts are calculated from the server-saved pending order. API secrets are used only on the server; the browser receives only the Razorpay key ID. Payments are recorded only after signature verification and payment fetching, or after a verified webhook. Webhook event IDs are stored to keep processing idempotent.

---

## ✦ API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health monitor reporting server and MongoDB connection status |
| `GET` | `/api/editions` | Public active and upcoming editions (supports `status`, `month`, `year`, `page`, `limit`) |
| `GET` | `/api/editions/[slug]` | Detailed public metadata for a single monthly collection |
| `POST` | `/api/checkout/quote` | Server-authoritative cart quote with pricing, coupon, shipping, and serviceability |
| `POST` | `/api/orders` | Creates a pending guest order and returns its payment access token |
| `POST` | `/api/payments/razorpay/order` | Creates or reuses a Razorpay order for a pending order |
| `POST` | `/api/payments/razorpay/verify` | Verifies a Razorpay payment signature and fetched payment status |
| `POST` | `/api/payments/razorpay/webhook` | Verifies and processes idempotent Razorpay webhook events |
| `POST` | `/api/payments/status` | Returns public order/payment status (token sent in the body, never in the URL) |

---

## ✦ Design System & Palette

* **Cream Canvas**: `#FDFBF7`
* **Warm Paper**: `#FAF6F0` / `#F4EFEA`
* **Terracotta**: `#C86446`
* **Muted Sage Green**: `#5E7160`
* **Dusty Rose**: `#B87D7B`
* **Espresso Ink Typography**: `#231B15`

---

## ✦ Deploying to Vercel

The app is a standard Next.js 15 (App Router) project and deploys to Vercel without extra configuration.

### 1. Import the repository
1. Push this repository to GitHub.
2. In Vercel, **Add New → Project** and import the repo.
3. Framework preset: **Next.js** (auto-detected). Build command: `npm run build`. Output: default.

### 2. Set environment variables
Add these in **Project → Settings → Environment Variables** (Production *and* Preview):

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL, e.g. `https://chitrakatha.vercel.app` |
| `SESSION_SECRET` | 32+ random characters (see `.env.example` for the generator one-liner) |
| `RAZORPAY_KEY_ID` | Razorpay key ID (paste when you enable payments) |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook signing secret |
| `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` | Only needed for the one-time admin bootstrap |

> `NEXT_PUBLIC_APP_URL` is inlined at build time. If you later attach a custom domain, update this variable **and redeploy**.

### 3. Allow Vercel to reach MongoDB Atlas
In Atlas → **Network Access**, allow `0.0.0.0/0` (Vercel serverless functions use dynamic IPs). Restrict by database user permissions where possible.

### 4. Create the admin user
Run the bootstrap script locally against the production database (it reads `.env.local`):

```bash
npm run init:admin
```

Then sign in at `https://<your-domain>/admin/login`.

### 5. Configure the Razorpay webhook (when payments go live)
Add a webhook in the Razorpay dashboard pointing to:

```
https://<your-domain>/api/payments/razorpay/webhook
```

Subscribe to `payment.captured`, `payment.authorized`, `payment.failed`, and `order.paid`.

### Pre-launch checklist
- [ ] `MONGODB_URI` and `SESSION_SECRET` set in Vercel
- [ ] `NEXT_PUBLIC_APP_URL` matches the live domain
- [ ] Atlas network access allows Vercel
- [ ] First admin created and login works
- [ ] Edition artwork uploaded under `public/images/editions/` (or absolute URLs in the admin)
- [ ] Razorpay keys + webhook configured (payments return `503 PAYMENT_NOT_CONFIGURED` until then)

**Operational notes**
- Rate limiting is in-process per instance. For multi-instance scale, move it to a shared store such as Redis.
- The payment access token is kept in `sessionStorage` and is never placed in a URL. A customer who closes the tab cannot resume payment until an order-confirmation email / payment-link mailer is added.

---

## ✦ License

Private property of Chitrakatha (ಚಿತ್ರಕಥಾ). All rights reserved.

