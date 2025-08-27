check port
> netstat -aon | findstr :8000

---

## AI-Mart E-Commerce Platform

This repository contains the full codebase for the AI-Mart e-commerce application, including a Next.js frontend, a FastAPI backend, and a Sanity.io CMS studio.

### Project Structure

- **/web-frontend**: The Next.js 14 client-side application hosted on Vercel.
- **/backend**: The Python FastAPI server-side application hosted on Render.
- **/sanity-studio**: The configuration for the Sanity.io headless CMS.
- **/chatbot**: A chatbot component for customer interaction.

### Payment Configuration (PayPal)

To ensure payments are processed correctly, you must configure the environment variables for both the frontend and backend services. This allows you to switch between a **sandbox** (for testing) and a **live** (for production) environment.

#### **1. Backend Configuration (on Render)**

Set the following environment variables in your Render dashboard for the FastAPI service:

- `PAYPAL_CLIENT_ID`: Your **live** PayPal application Client ID.
- `PAYPAL_CLIENT_SECRET`: Your **live** PayPal application Client Secret.
- `PAYPAL_WEBHOOK_ID`: Your **live** PayPal application Webhook ID.
- `PAYPAL_MODE`: Set this to `live` to process real payments. If this variable is missing or set to any other value, it will default to `sandbox` mode.

**Example:**
```
PAYPAL_CLIENT_ID=YOUR_LIVE_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_LIVE_SECRET
PAYPAL_WEBHOOK_ID=YOUR_LIVE_WEBHOOK_ID
PAYPAL_MODE=live
```

#### **2. Frontend Configuration (on Vercel)**

Set the following environment variables in your Vercel dashboard for the Next.js application:

- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`: Your **live** PayPal application Client ID. This key is public and used by the PayPal script in the browser to render the payment buttons.
- `NEXT_PUBLIC_API_BASE_URL`: The URL of your deployed FastAPI backend (e.g., `https://your-backend-on-render.onrender.com`).

**Example:**
```
NEXT_PUBLIC_PAYPAL_CLIENT_ID=YOUR_LIVE_CLIENT_ID
NEXT_PUBLIC_API_BASE_URL=https://your-backend-on-render.onrender.com
```

#### **How to Switch Between Environments**

- **To use LIVE mode:**
  - Set `PAYPAL_MODE=live` on Render.
  - Use your **live** `PAYPAL_CLIENT_ID` for `NEXT_PUBLIC_PAYPAL_CLIENT_ID` on Vercel.

- **To use SANDBOX mode:**
  - Set `PAYPAL_MODE=sandbox` (or remove the variable) on Render.
  - Use your **sandbox** `PAYPAL_CLIENT_ID` for `NEXT_PUBLIC_PAYPAL_CLIENT_ID` on Vercel.
  - You will also need to use sandbox credentials for `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` on Render.
