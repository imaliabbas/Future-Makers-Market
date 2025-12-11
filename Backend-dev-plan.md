# Backend Development Plan — Future Makers Market for Kids

## 1️⃣ Executive Summary
This document outlines the backend development strategy for the **Future Makers Market for Kids**. The goal is to build a secure, scalable, and kid-friendly e-commerce platform where children can sell handmade goods under parental supervision.

**Key Constraints & Tech Stack:**
- **Framework:** FastAPI (Python 3.13, async)
- **Database:** MongoDB Atlas (using Motor & Pydantic v2)
- **Infrastructure:** No Docker, Local execution
- **Workflow:** Single branch `main`, manual testing per task
- **API Pattern:** `/api/v1/*`

The development is divided into **6 Sprints (S0–S5)** to incrementally deliver value, starting from infrastructure setup to full marketplace transaction flows.

---

## 2️⃣ In-Scope & Success Criteria

### In-Scope Features (Frontend Visible)
- **Authentication:** Signup, Login, Logout for Kid, Parent, Buyer, Admin.
- **Storefronts:** Create/Edit public profiles for Kids.
- **Products:** Create/Edit/Delete listings. Image handling.
- **Parental Controls:** Approve/Reject child listings, view child's earnings.
- **Marketplace:** Search/Filter active products.
- **Cart & Checkout:** Order creation, Stripe payment simulation (or integration).
- **Dashboards:** Order history, Inventory management.

### Success Criteria
- All frontend routes connect to real backend endpoints.
- MongoDB Atlas reflects the state of the application correctly.
- Manual verification steps pass for every task.
- Code is pushed to `main` only after passing manual tests.

---

## 3️⃣ API Design

**Base Path:** `/api/v1`
**Error Format:** `{ "error": "Descriptive message" }`

### Auth
- `POST /auth/signup` — Register new user (handles role-specific logic).
- `POST /auth/login` — Authenticate and return JWT.
- `POST /auth/logout` — Clear auth cookie/token.
- `GET /auth/me` — Get current user context.

### Storefronts
- `GET /storefronts/{id}` — Get public storefront details.
- `GET /storefronts/mine` — Get current kid's storefront.
- `POST /storefronts` — Create a storefront.
- `PATCH /storefronts/{id}` — Update storefront details.

### Products
- `GET /products` — List active products (supports `?search=` and `?storefront_id=`).
- `GET /products/{id}` — Get single product detail.
- `POST /products` — Create new listing (starts as `pending_approval`).
- `PATCH /products/{id}` — Edit listing.
- `DELETE /products/{id}` — Delete listing.
- `POST /products/upload` — Upload product image (returns URL).

### Parent Actions
- `GET /parent/approvals` — List pending products for linked children.
- `POST /parent/approvals/{product_id}` — Approve or Reject a listing.
- `GET /parent/children` — Get linked child accounts.

### Orders & Checkout
- `POST /orders` — Create a new order (checkout).
- `GET /orders/mine` — Get orders for current user (Buyer view or Seller view).

---

## 4️⃣ Data Model (MongoDB Atlas)

### `users`
- `_id`: ObjectId
- `email`: string (unique)
- `password_hash`: string
- `role`: string ("kid_seller", "parent_guardian", "buyer", "admin")
- `parent_id`: ObjectId (optional, for kids)
- `display_name`: string
- **Example:** `{ "email": "kid@test.com", "role": "kid_seller", "parent_id": "...", "display_name": "Maya" }`

### `storefronts`
- `_id`: ObjectId
- `kid_id`: ObjectId (ref `users`)
- `display_name`: string
- `description`: string
- `status`: string ("active", "draft")
- **Example:** `{ "kid_id": "...", "display_name": "Maya's Shop", "status": "active" }`

### `products`
- `_id`: ObjectId
- `storefront_id`: ObjectId
- `name`: string
- `price`: float
- `quantity`: int
- `images`: list[string]
- `status`: string ("active", "pending_approval", "rejected", "sold_out")
- **Example:** `{ "name": "Bracelet", "price": 5.00, "status": "pending_approval" }`

### `orders`
- `_id`: ObjectId
- `buyer_id`: ObjectId (optional)
- `items`: list[object] (`product_id`, `qty`, `price`)
- `total`: float
- `status`: string ("completed")
- `created_at`: datetime
- **Example:** `{ "total": 15.00, "items": [...], "status": "completed" }`

---

## 5️⃣ Frontend Audit & Feature Map

| Page / Component | Endpoint Needed | Auth Required? | Notes |
|------------------|-----------------|----------------|-------|
| `LoginPage` | `POST /auth/login` | No | |
| `RegisterPage` | `POST /auth/signup` | No | Link Kid to Parent via email |
| `MarketplacePage` | `GET /products` | No | Search query param |
| `ProductDetailPage`| `GET /products/{id}` | No | |
| `MyStorefrontPage` | `GET /storefronts/mine`, `POST/PATCH` | Yes (Kid) | |
| `MyProductsPage` | `GET /products?seller_id=me` | Yes (Kid) | |
| `PendingApprovals` | `GET /parent/approvals` | Yes (Parent)| |
| `CartPage` | `POST /orders` | Optional | Guest checkout possible? |

---

## 6️⃣ Configuration & ENV Vars

- `APP_ENV`: `development`
- `PORT`: `8000`
- `MONGODB_URI`: `mongodb+srv://...`
- `JWT_SECRET`: `secure-random-string`
- `JWT_ALGORITHM`: `HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES`: `30`
- `CORS_ORIGINS`: `http://localhost:5173`

---

## 7️⃣ Background Work
*None required for MVP features.* All actions (emails, approvals) are synchronous or deferred.

---

## 8️⃣ Integrations

- **Stripe (Mocked/Simulated for MVP Phase 1):**
  - Real integration requires frontend Stripe Elements. For MVP Phase 1, we will mock the payment endpoint to accept "success" tokens and create orders immediately.
  - *Future:* `STRIPE_SECRET_KEY`

- **Image Upload:**
  - Endpoint: `POST /api/v1/products/upload`
  - Implementation: Save file to local `static/uploads` directory and return relative URL.
  - Config: Mount `/static` in FastAPI.

---

## 9️⃣ Testing Strategy

- **Scope:** Manual End-to-End testing via Frontend.
- **Process:**
  1.  Implement Backend Task.
  2.  Update Frontend config/api calls (if needed).
  3.  **Execute Manual Test Step.**
  4.  If Pass: Commit & Push.
  5.  If Fail: Fix & Retry.

---

## 🔟 Dynamic Sprint Plan & Backlog (S0 → S5)

### 🧱 S0 – Environment Setup & Infrastructure

**Objectives:**
- Initialize FastAPI project structure.
- Connect to MongoDB Atlas.
- Setup Static file serving (for images).
- Configure CORS.

**Tasks:**
- **Task 0.1: Project Init & Database**
  - Init FastAPI app, `main.py`, `database.py`.
  - Connect `Motor` client.
  - **Test Step:** Visit `http://localhost:8000/healthz` -> returns `{"status": "ok", "db": "connected"}`.
  - **User Test Prompt:** "Check health endpoint in browser."

- **Task 0.2: Global Config & CORS**
  - Setup Pydantic `Settings`.
  - Allow CORS for `localhost:5173`.
  - **Test Step:** Frontend call to backend doesn't show CORS error.
  - **User Test Prompt:** "Inspect network tab for CORS errors on basic fetch."

---

### 🧩 S1 – Authentication (The Foundation)

**Objectives:**
- User registration with role handling.
- Login/Logout flows with JWT.

**Tasks:**
- **Task 1.1: User Models & Signup Endpoint**
  - create `User` model.
  - `POST /auth/signup`: Support Kid (with `parent_email`), Parent, Buyer.
  - **Test Step:** Register a Parent, then register a Kid linked to that Parent. Check DB.
  - **User Test Prompt:** "Register a parent account, then a kid account."

- **Task 1.2: Login & JWT**
  - `POST /auth/login`: Validate hash, return Access Token.
  - `GET /auth/me`: Return current user info.
  - **Test Step:** Login on frontend, see Dashboard instead of Login page.
  - **User Test Prompt:** "Log in with the new accounts and verify redirection."

---

### 🎨 S2 – Kid Seller Features (Storefront & Inventory)

**Objectives:**
- Allow kids to manage their identity and products.
- Image upload handling.

**Tasks:**
- **Task 2.1: Storefront Management**
  - `Storefront` model.
  - `POST /storefronts`, `GET /storefronts/mine`.
  - **Test Step:** Kid user creates storefront name/desc. Refreshes page to see saved data.
  - **User Test Prompt:** "As a Kid, create your storefront and verify details persist."

- **Task 2.2: Image Upload Service**
  - `POST /products/upload`: Accept `Multipart/Form-Data`, save to `/static/uploads`, return URL.
  - **Test Step:** Use Postman or simple form to upload image, access URL in browser.
  - **User Test Prompt:** "Upload an image and verify it loads in the browser."

- **Task 2.3: Product CRUD (Basic)**
  - `Product` model.
  - `POST /products`: Create product (auto-status: `pending_approval`).
  - `GET /products?seller_id=me`: List own products.
  - **Test Step:** Create a product on "My Products" page.
  - **User Test Prompt:** "Create a product. Ensure it appears in your list."

---

### 🛡️ S3 – Parent Supervision

**Objectives:**
- Parent approval workflow.

**Tasks:**
- **Task 3.1: Pending Approvals**
  - `GET /parent/approvals`: Aggregate products from linked kids where `status="pending_approval"`.
  - **Test Step:** Login as Parent, see the product created in S2.
  - **User Test Prompt:** "Login as Parent. Check 'Pending Approvals' page."

- **Task 3.2: Approve/Reject Action**
  - `POST /parent/approvals/{id}`: Accept body `{"action": "approve"}`. Update status to `active`.
  - **Test Step:** Approve the product. Login as Kid, see status `active`.
  - **User Test Prompt:** "Approve the product. Verify status update on Kid's dashboard."

---

### 🛒 S4 – Marketplace & Buying

**Objectives:**
- Public product discovery.
- Order processing.

**Tasks:**
- **Task 4.1: Public Marketplace**
  - `GET /products`: Filter by `status="active"`. Support keyword search.
  - **Test Step:** Visit Marketplace (incognito). See approved product.
  - **User Test Prompt:** "Browse marketplace as guest. Find the approved product."

- **Task 4.2: Order Creation (Checkout)**
  - `Order` model.
  - `POST /orders`: Accept items list. Calculate total. Deduct inventory (simple check).
  - **Test Step:** Add to cart, Checkout. Verify Order created in DB and Product quantity reduced.
  - **User Test Prompt:** "Complete a purchase. Verify product stock decreases."

---

### 📊 S5 – Dashboards & Admin (Cleanup)

**Objectives:**
- Visibility for all users.

**Tasks:**
- **Task 5.1: Sales Dashboards**
  - `GET /orders/mine`: Return orders.
  - Update Frontend to display real data.
  - **Test Step:** Kid sees new order in "My Orders".
  - **User Test Prompt:** "Check Kid dashboard for the new sale."

- **Task 5.2: Admin View**
  - Admin endpoint to see all users/products.
  - **Test Step:** Admin logs in, sees everything.
  - **User Test Prompt:** "Login as Admin. Verify visibility of all platform data."