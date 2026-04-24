# Setup Instructions for BookingHub Multi-Service Reservation Platform

## Project Overview
A full-stack intelligent booking platform for multiple services with AI-powered recommendations and geolocation features.

### Tech Stack
- **Backend**: NestJS + Node.js
- **Frontend**: Next.js (React) + TypeScript
- **Database**: MongoDB + Redis
- **Authentication**: JWT + Bcrypt
- **Geolocation**: Mapbox GL JS
- **AI**: Rasa/Dialogflow + AssemblyAI

---

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create `.env` file in backend directory:
```bash
cp .env.example .env
```

Then edit `.env` with your values:
```
MONGODB_URI=mongodb://localhost:27017/booking-service
JWT_SECRET=your-secure-secret-key-min-32-chars
REDIS_HOST=localhost
REDIS_PORT=6379
MAPBOX_TOKEN=your-mapbox-token
DIALOGFLOW_PROJECT_ID=your-dialogflow-project
ASSEMBLYAI_API_KEY=your-assemblyai-key
SENDGRID_API_KEY=your-sendgrid-key
PORT=3000
FRONTEND_URL=http://localhost:3001
```

### 3. MongoDB Setup
- Install MongoDB Community Edition locally OR
- Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### 4. Redis Setup
- Install Redis locally OR
- Use Redis Cloud: https://redis.com/try-free/

### 5. Start Backend Server
```bash
npm run start:dev
```
Backend will run on: `http://localhost:3000`

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration
Create `.env.local` file in frontend directory:
```bash
cp .env.example .env.local
```

Then edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

### 3. Get Mapbox Token
1. Sign up at https://mapbox.com
2. Generate an access token from dashboard
3. Add to `.env.local`

### 4. Start Frontend Server
```bash
npm run dev
```
Frontend will run on: `http://localhost:3001`

---

## Core Modules Architecture

### Backend Modules
```
auth/          - JWT authentication, registration, login
users/         - User profiles (client, provider, admin)
services/      - Service management and creation
reservations/  - Booking & reservation management
reviews/       - Service ratings and reviews
search/        - Unified search with smart ranking
notifications/ - Email/SMS/in-app notifications
dashboard/     - Provider analytics & statistics
ai/            - Chatbot, voice support, recommendations
```

### Database Schemas
- **User**: Authentication & profile data
- **Service**: Service details, location, pricing
- **Reservation**: Bookings with status tracking
- **Review**: Ratings & comments
- **Notification**: User notifications

---

## Key Features Implemented

### ✅ Authentication
- Email/password registration
- JWT token with 15min access + 7day refresh
- Role-based access (client/provider/admin)
- Bcrypt password hashing (cost 12)

### ✅ Search & Filtering
- Full-text search
- Price range filtering
- Distance-based filtering
- Category filtering
- Smart ranking algorithm

### ✅ Geolocation
- Mapbox integration for maps
- Nearby services search
- Distance calculations

### ✅ Reservations
- Real-time availability
- 10-minute pending timeout (Redis TTL)
- Automatic expiration
- Status tracking: pending → confirmed → completed/cancelled

### ✅ Reviews & Ratings
- 5-star rating system
- Comment support
- Average rating aggregation
- Review reporting

### ✅ Notifications
- Email notifications (setup with SendGrid)
- In-app notifications
- Notification history & read status

### ✅ Dashboard
- Provider statistics
- Revenue tracking
- Reservation analytics
- Rating analysis

### ✅ AI Features (Stubs)
- Chatbot interface
- Speech-to-text
- Text-to-speech
- Recommendation engine

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Services
- `GET /api/services` - List services
- `POST /api/services` - Create service (provider)
- `GET /api/services/:id` - Service details
- `GET /api/services/nearby?lng=X&lat=Y&distance=Z` - Nearby services

### Search
- `GET /api/search?q=query&category=...&minPrice=...&maxPrice=...` - Search services

### Reservations
- `POST /api/reservations` - Create reservation
- `GET /api/reservations/:id` - Get reservation
- `POST /api/reservations/:id/confirm` - Confirm reservation
- `POST /api/reservations/:id/cancel` - Cancel reservation

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/service/:serviceId` - Get service reviews
- `POST /api/reviews/:id/report` - Report review

### Notifications
- `GET /api/notifications/user/:userId` - Get notifications
- `POST /api/notifications/:id/mark-as-read` - Mark as read

### Dashboard
- `GET /api/dashboard/provider/:providerId?period=month` - Provider stats

### AI
- `POST /api/ai/chatbot` - Chat with AI
- `GET /api/ai/recommendations/:userId` - Get recommendations

---

## Development Workflow

### Adding New Features
1. Create DTO in `modules/feature/dto/`
2. Create schema in `database/schemas/`
3. Create service in `modules/feature/feature.service.ts`
4. Create controller in `modules/feature/feature.controller.ts`
5. Create module in `modules/feature/feature.module.ts`
6. Import module in `app.module.ts`

### Database Indexing
- 2dsphere index for geolocation queries
- Compound indexes for common queries
- TTL indexes for auto-expiring documents

---

## Next Steps / TODO

1. **Implement JWT Guards**
   - Create JWT guard for protected routes
   - Add role-based guards (client/provider/admin)

2. **Complete AI Integration**
   - Set up Rasa/Dialogflow
   - Integrate AssemblyAI for speech
   - Implement recommendation engine

3. **Error Handling**
   - Global exception filters
   - Proper error responses
   - Logging (Sentry)

4. **Testing**
   - Unit tests with Jest
   - Integration tests
   - E2E tests

5. **Deployment**
   - Docker containerization
   - AWS/VPS setup
   - CI/CD pipeline

6. **Frontend Pages**
   - Provider dashboard
   - My reservations
   - Edit profile
   - Settings

7. **Real-time Features**
   - WebSocket integration
   - Live availability updates
   - Real-time notifications

8. **Payment Integration**
   - Stripe/PayPal setup
   - Transaction handling

---

## Testing the Application

### 1. Register as Client
```
Email: client@test.com
Password: TestPassword123!
Role: Client
```

### 2. Register as Provider
```
Email: provider@test.com
Password: TestPassword123!
Role: Provider
```

### 3. Create a Service (as Provider)
- Navigate to service creation
- Add service details, pricing, location
- Set availability slots

### 4. Search Services (as Client)
- Use search bar with filters
- View on map
- Make reservation

### 5. Leave Review
- After visiting service
- Rate and comment
- Help other users

---

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`

### Redis Connection Error
- Ensure Redis is running: `redis-server`
- Check host/port in `.env`

### Frontend API 404 Errors
- Verify backend is running on port 3000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`

### Mapbox Not Showing
- Verify token is valid
- Check map container size (h-96)
- Ensure geolocation permission granted

---

## Resources & Documentation

- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [MongoDB Docs](https://docs.mongodb.com)
- [Mapbox Docs](https://docs.mapbox.com)
- [JWT](https://jwt.io)

---

## Project Structure Summary

```
booking-service/
├── backend/
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── database/
│   │   │   └── schemas/
│   │   └── modules/
│   │       ├── auth/
│   │       ├── services/
│   │       ├── reservations/
│   │       ├── reviews/
│   │       ├── search/
│   │       ├── notifications/
│   │       ├── dashboard/
│   │       └── ai/
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── page.tsx
    │   ├── layout.tsx
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   ├── SearchBar.tsx
    │   │   ├── ServiceCard.tsx
    │   │   ├── Map.tsx
    │   │   ├── ReviewsList.tsx
    │   │   ├── ReservationForm.tsx
    │   │   └── Chatbot.tsx
    │   └── pages/
    │       ├── login.tsx
    │       ├── register.tsx
    │       ├── search.tsx
    │       ├── notifications.tsx
    │       └── service/[id].tsx
    ├── lib/
    │   ├── api/client.ts
    │   ├── types/index.ts
    │   └── hooks/
    │       ├── useAuth.ts
    │       └── useServices.ts
    ├── .env.example
    └── package.json
```

---

## Success Criteria ✅

- ✅ Multi-module NestJS backend
- ✅ MongoDB with geolocation support
- ✅ JWT authentication
- ✅ Service search & filtering
- ✅ Real-time reservations with timeout
- ✅ Review & rating system
- ✅ Next.js frontend with TypeScript
- ✅ Responsive UI with Tailwind CSS
- ✅ API integration layer
- ✅ Custom hooks for data fetching
- ✅ Chatbot component
- ✅ Map integration
- ✅ Multi-role support (client/provider/admin)

---

**Happy coding! 🚀**
