# ecommerce-ai-assistant — Memory Guide

🗓️ Last updated: 18 Sep 2025

## 🎯 Aim of the App
An **AI-powered hybrid eCommerce platform** combining:
- **Supabase** for dynamic product, cart, order data
- **Sanity** for promotions, banners, CMS-managed marketing content
- **FastAPI** backend to unify both
- **Next.js** frontend for UI
- **Chainlit** chatbot for AI shopping assistant

---

## ⚙️ Tech Stack Overview
- **Backend**: FastAPI (with Uvicorn)  
- **Database**: Supabase (Postgres, accessed via SQLModel + psycopg)  
- **CMS**: Sanity.io (schemas: products, promos)  
- **Frontend**: Next.js with `/src/app/` pages  
- **Chatbot**: Chainlit assistant (AI-powered)  
- **Deployment**: Docker + uv for Python dependencies  

---

## 📂 Project Structure
ecommerce-ai-assistant/
│
├── backend/ # FastAPI app
│ ├── main.py # Entrypoint with endpoints
│ ├── db.py # DB connection (Supabase/Postgres)
│ ├── settings.py # Env variables (Supabase URL, Key, DB URL, Sanity Token)
│ ├── sanity_client.py # Fetch promos from Sanity
│ └── supabase_client.py # Fetch products/promos from Supabase
│
├── ecommerceaiassistant/ # Sanity Studio (CMS)
│ ├── sanity.config.ts
│ └── schemaTypes/
│ ├── index.ts
│ ├── product.ts
│ └── promo.ts
│
├── frontend/ # (future) Next.js app
│ └── ...
│
├── Dockerfile
├── requirements.txt / pyproject.toml
└── README.md


---

## 🚀 Current Progress
- ✅ FastAPI endpoints live:
  - `POST /seed_products` → seed single product into Supabase
  - `POST /seed_list_products` → seed multiple products
  - `GET /products` → fetch products from Supabase
  - `GET /promos` → fetch promos (Sanity + Supabase hybrid)
- ✅ Sanity schemas (`product.ts`, `promo.ts`) set up
- ✅ Supabase project created, connection string & API key stored in `.env`
- ✅ Database tables auto-created with SQLModel
- ✅ App starts successfully

---

## 🔜 Next Steps
1. **Seed initial data** into Supabase (products, categories)  
2. **Connect Next.js frontend** to FastAPI APIs (`/products`, `/promos`)  
3. **Implement Cart APIs** in backend (Supabase)  
   - `POST /cart/add`  
   - `GET /cart/{user_id}`  
   - `DELETE /cart/remove/{item_id}`  
4. **Frontend Pages**  
   - `/products` → list products  
   - `/cart` → cart page  
   - `/promotions` → pull banners from Sanity  
5. **AI Integration**: Chainlit shopping assistant to query FastAPI  
6. **Deployment** (Railway/Render/Vercel for frontend + backend)  

---

✅ This file is your **memory refresher** — read it when you come back after months to instantly recall project setup and flow.
