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

👉 For detailed guide, see [docs/memory_guide.md](./MEMORY_GUIDE.md)
