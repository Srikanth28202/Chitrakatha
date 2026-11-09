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
    ├── hooks/                        # useLanguage, useMediaQuery
    ├── i18n/                         # Dictionaries (en, kn) & LanguageProvider context
    ├── lib/                          # db.ts (Mongoose connection cache), api-response, validations, mapper
    ├── models/                       # Mongoose schemas: User, Edition, Order, Subscription, Payment, Coupon, Shipment, Setting
    ├── services/                     # EditionService & SubscriptionService
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
ADMIN_EMAIL=admin@chitrakatha.art
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

---

## ✦ API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health monitor reporting server and MongoDB connection status |
| `GET` | `/api/editions` | Public active and upcoming editions (supports `month`, `year`, `page`, `limit`) |
| `GET` | `/api/editions/[slug]` | Detailed public metadata for a single monthly collection |

---

## ✦ Design System & Palette

* **Cream Canvas**: `#FDFBF7`
* **Warm Paper**: `#FAF6F0` / `#F4EFEA`
* **Terracotta**: `#C86446`
* **Muted Sage Green**: `#5E7160`
* **Dusty Rose**: `#B87D7B`
* **Espresso Ink Typography**: `#231B15`

---

## ✦ License

Private property of Chitrakatha (ಚಿತ್ರಕಥಾ). All rights reserved.

