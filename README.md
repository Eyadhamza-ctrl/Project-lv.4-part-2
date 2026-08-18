# ⚡ EventPulse — Event Management Backend API

**EventPulse** is a production-ready, high-performance RESTful API and real-time backend engine built for modern Event Management applications. It features robust JWT Authentication, Role-Based Access Control (RBAC), advanced event querying (filtering, text search, sorting, pagination), race-condition-safe registration management, and real-time WebSocket announcements via Socket.io.

---

## 🌟 Key Features

- **🔐 User & Authentication System**
  - Registration & Login with `bcrypt` password hashing (10 salt rounds).
  - Statetul & Stateless auth support via **JSON Web Tokens (JWT)** and HTTP-Only Cookies.
  - Role-Based Access Control (**RBAC**): `admin` and `attendee` roles.
  - Excludes password fields automatically from all database queries & JSON serialization.

- **📅 Event Management (CRUD)**
  - Full CRUD functionality for events.
  - Admin-restricted event creation, modification, and deletion.
  - Rich schemas including capacity, category, venue, city, date, image, and popularity score tracking.

- **🔍 Advanced Query Features**
  - **Pagination**: `?page=1&limit=10`
  - **Sorting**: Multi-field sorting (`?sort=-date,popularity`)
  - **Filtering**: By category (`?category=Music`), city (`?city=Cairo`), and date.
  - **Text Search**: Full-text search across event title, description, category, and venue (`?search=concert`).

- **🎟️ Registration System**
  - Unique index constraints to prevent duplicate user registrations.
  - Real-time capacity checks to prevent over-subscription.
  - Atomic database counters (`$inc`) for `attendeesCount` and `popularity`.
  - Registered attendees retrieval per event.

- **📢 Real-Time Announcements (Socket.io)**
  - Event-specific WebSocket rooms (`event:<id>`) and global broadcast channel.
  - Dedicated Admin endpoint (`POST /api/events/:id/announcements`) to push live notifications to connected clients.

- **🛡️ Security & Sanitation**
  - **Helmet**: Security HTTP header protection.
  - **CORS**: Configurable cross-origin resource sharing.
  - **Express Rate Limit**: Prevents brute-force and DDoS attacks (100 requests per 15 mins).
  - **Express Mongo Sanitize**: Protects against NoSQL injection attacks.
  - **Validation**: Strict validation with `express-validator` returning HTTP 422 error payloads.

- **📚 Interactive API Documentation**
  - Swagger UI built-in at `/api-docs`.
  - Interactive testing for all endpoints with Bearer Token auth support.

- **🏥 Health & Monitoring**
  - `GET /health` endpoint monitoring server uptime and MongoDB connection state.

---

## 🛠️ Tech Stack

- **Runtime & Framework**: Node.js (ES Modules) + Express.js
- **Database**: MongoDB Atlas + Mongoose ORM
- **Real-Time Engine**: Socket.io
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **Validation**: `express-validator`
- **Security**: `helmet`, `cors`, `express-rate-limit`, `express-mongo-sanitize`
- **Documentation**: Swagger UI (`swagger-ui-express`)
- **Testing**: Jest + Supertest + `mongodb-memory-server`

---

## 📁 Project Architecture

```
src/
├── config/
│   ├── db.js             # Mongoose connection logic
│   └── swagger.js        # Swagger UI OpenAPI 3.0 configuration
├── controllers/
│   ├── announcement.controller.js
│   ├── auth.controller.js
│   ├── event.controller.js
│   └── registration.controller.js
├── docs/
│   └── swagger.js        # Detailed API documentation specs
├── middlewares/
│   ├── auth.middleware.js       # Protect & RestrictTo (RBAC) middlewares
│   ├── error.middleware.js      # Global error handling middleware
│   ├── notFound.middleware.js   # 404 Route handler
│   ├── rateLimiter.middleware.js # Express Rate Limiting
│   └── validate.middleware.js  # express-validator result handler
├── models/
│   ├── event.model.js
│   ├── registration.model.js
│   └── user.model.js
├── routes/
│   ├── auth.routes.js
│   ├── event.routes.js
│   └── index.js
├── services/
│   ├── auth.service.js
│   ├── event.service.js
│   └── registration.service.js
├── sockets/
│   └── index.js          # Socket.io setup and room listeners
├── utils/
│   ├── appError.js       # Operational AppError class
│   ├── asyncHandler.js   # Async route wrapper
│   ├── jwt.js            # Token generation and verification
│   └── logger.js         # Logging helper
├── validations/
│   ├── announcement.validation.js
│   ├── auth.validation.js
│   └── event.validation.js
├── app.js                # Express App initialization
└── server.js             # HTTP & Socket.io server bootstrap

tests/
├── auth.test.js
├── error.test.js
├── event.test.js
├── health.test.js
├── registration.test.js
└── setup.js              # MongoDB Memory Server setup

.env.example              # Environment variables template
jest.config.js            # Jest ES Module configuration
package.json
vercel.json               # Vercel serverless deployment config
README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/eventpulse?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_eventpulse_2026
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

---

## 🚀 Installation & Local Execution

### 1. Clone the repository
```bash
git clone https://github.com/your-username/eventpulse-backend.git
cd eventpulse-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

### 4. Production Start
```bash
npm run start
```

---

## 🧪 Running Tests

EventPulse includes an automated test suite running against an **in-memory MongoDB server** (`mongodb-memory-server`).

### Run all tests with coverage:
```bash
npm run test
```

### Run tests in watch mode:
```bash
npm run test:watch
```

### Output coverage report:
```bash
npm run coverage
```

---

## 📖 API Documentation (Swagger)

Once the server is running, navigate to:
👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

### Summary of Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | System Health & DB Connection Status |
| `POST` | `/api/auth/register` | Public | Register new User (`admin` or `attendee`) |
| `POST` | `/api/auth/login` | Public | Authenticate User & receive JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve profile of logged-in user |
| `GET` | `/api/events` | Public | List events with Search, Filter, Sort & Pagination |
| `POST` | `/api/events` | Admin | Create a new event |
| `GET` | `/api/events/:id` | Public | Get single event details |
| `PATCH` | `/api/events/:id` | Admin | Update event details |
| `DELETE` | `/api/events/:id` | Admin | Delete event |
| `POST` | `/api/events/:id/register` | Authenticated | Register for an event |
| `DELETE` | `/api/events/:id/register` | Authenticated | Unregister from an event |
| `GET` | `/api/events/:id/attendees` | Authenticated | Get list of event attendees |
| `POST` | `/api/events/:id/announcements` | Admin | Broadcast live announcement via Socket.io |

---

## 🔌 Socket.io Real-Time Integration

Client-side connection example:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

// Join room for a specific event
socket.emit("join_event", "EVENT_ID_HERE");

// Listen for live announcements
socket.on("announcement", (data) => {
  console.log("📢 New Announcement:", data.message);
});
```

---

## 🖼️ Application Preview / Screenshots

<!-- Screenshot Placeholders -->
![Swagger API Docs Placeholder](https://via.placeholder.com/800x400.png?text=EventPulse+Swagger+UI+Documentation)
![Socket.io Live Broadcast Placeholder](https://via.placeholder.com/800x400.png?text=Real-time+Socket.io+Announcement+Flow)

---

## 🌐 Deployment Ready (Vercel & MongoDB Atlas)

This repository comes pre-configured with `vercel.json` for seamless serverless deployment.

1. Deploy database on **MongoDB Atlas** and retrieve the connection string.
2. Link repository to **Vercel**.
3. Configure Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`) in Vercel settings.
4. Deploy!

---

## 🔮 Future Improvements

- [ ] Email notification integration via Nodemailer / SendGrid upon event registration.
- [ ] QR code generation for event ticket verification.
- [ ] Payment gateway integration (Stripe / Paymob) for paid events.
- [ ] Waitlist management system when event capacity is reached.

---

## 📄 License

This project is licensed under the **MIT License**.
