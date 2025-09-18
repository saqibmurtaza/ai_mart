# ecommerce-ai-assistant

## ChatGpt Converstion Link - https://chatgpt.com/c/68cbb34a-88d0-8324-a652-4daf9dde17ca

🗓️ Last updated: 18 Sep 2025

## 📖 Memory Guide (Quick Reminder)

### Goal
AI-powered hybrid eCommerce app (FastAPI + Next.js frontend + Supabase + Sanity).  
Focus: Dynamic products (Supabase) + promotions/banners (Sanity).

### Tech Stack
- **Backend**: FastAPI  
- **Database**: Supabase (Postgres)  
- **CMS**: Sanity (promotions, marketing content)  
- **Frontend**: Next.js  
- **Chatbot**: Chainlit (shopping assistant)

### Current Status
- FastAPI endpoints:  
  - `POST /seed_products` (seed sample products)  
  - `POST /seed_list_products` (seed multiple products)  
  - `GET /products` (list products from Supabase)  
  - `GET /promos` (fetch promos from Sanity or Supabase hybrid)  
- Sanity schemas (`product.ts`, `promo.ts`) defined under `ecommerceaiassistant/schemaTypes/`  
- Supabase project created, DB connection set  
- App boots successfully, tables being created  

### Next Steps
- Insert initial product data into Supabase  
- Connect frontend (Next.js) to these APIs  
- Expand cart + order APIs  

---

### Cron Expression Breakdown 📅
- 0: This sets the minute to 0, meaning the job will run at the start of the hour.

- 10: This sets the hour to 10, meaning it will run at 10:00 AM.

- *: The third and fourth fields, for the day of the month and month, use wildcards. This means the job will run on every day of the month and every month.

- 0: The last field represents the day of the week. The number 0 corresponds to Sunday (some systems use 7 for Sunday, but 0 is common).
- **This configuration tells Vercel to run your /api/cron endpoint every Sunday at 10:00 AM**

👉 For detailed guide, see [docs/memory_guide.md](./MEMORY_GUIDE.md)
