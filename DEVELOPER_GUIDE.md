# BookingHub - Developer Quick Reference

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
npm run start:dev    # Development mode with auto-reload
npm run build        # Production build
npm run start         # Production mode
```

### Frontend  
```bash
cd frontend
npm install
npm run dev          # Development server
npm run build        # Production build
npm run start         # Production server
```

## 📂 Project Structure Overview

### Backend Modules (NestJS)

#### `auth/` - Authentication
- Handles JWT generation, registration, login
- Uses bcrypt for password hashing
- **Files**: `auth.service.ts`, `auth.controller.ts`, `auth.module.ts`
- **Key Methods**: `register()`, `login()`, `generateTokens()`

#### `services/` - Service Management
- CRUD operations for services
- Geolocation queries (2dsphere)
- Smart score calculation
- **Key Methods**: `create()`, `findNearby()`, `updateSmartScore()`

#### `reservations/` - Booking System
- Create, confirm, cancel reservations
- Redis TTL for 10-minute pending timeout
- Status transitions: pending → confirmed → completed/cancelled → expired
- **Key Methods**: `create()`, `confirm()`, `cancel()`

#### `reviews/` - Ratings & Reviews
- Create and manage reviews
- Aggregate ratings for services
- Report abusive reviews
- **Key Methods**: `create()`, `getServiceAverageRating()`, `report()`

#### `search/` - Search Engine
- Full-text search across services
- Advanced filtering (price, rating, category, distance)
- Smart ranking algorithm: (0.4 × rating) + (0.3 × proximity) + (0.2 × popularity) + (0.1 × price)
- **Key Methods**: `searchServices()`, `calculateSmartScore()`

#### `notifications/` - Alerts & Messages
- Send/manage notifications
- Multiple channels: email, SMS, in-app
- Track read status
- **Key Methods**: `create()`, `markAsRead()`, `findByUserId()`

#### `dashboard/` - Provider Analytics
- Reservation statistics
- Revenue tracking
- Rating analysis
- Cancellation rates
- **Key Methods**: `getProviderDashboard()`

#### `ai/` - Artificial Intelligence
- Chatbot interface (placeholder for Rasa/Dialogflow)
- Speech recognition (placeholder for AssemblyAI)
- Text-to-speech
- Recommendations engine
- **Key Methods**: `chatbotQuery()`, `speechToText()`, `textToSpeech()`, `generateRecommendations()`

### Frontend Pages & Components

#### Pages (`app/pages/`)
- `login.tsx` - User login
- `register.tsx` - User registration
- `search.tsx` - Service search & filtering
- `service/[id].tsx` - Service details
- `notifications.tsx` - User notifications

#### Components (`app/components/`)
- `Navbar.tsx` - Navigation bar with user menu
- `SearchBar.tsx` - Search with advanced filters
- `ServiceCard.tsx` - Service preview card
- `Map.tsx` - Mapbox integration
- `ReviewsList.tsx` - Service reviews display
- `ReservationForm.tsx` - Booking form
- `Chatbot.tsx` - AI chat interface

#### API Layer (`lib/api/client.ts`)
- Axios client with base URL configuration
- Request interceptors for JWT tokens
- Organized API methods by module

#### Hooks (`lib/hooks/`)
- `useAuth.ts` - Authentication logic (login, register, logout)
- `useServices.ts` - Service fetching and searching

#### Types (`lib/types/index.ts`)
- TypeScript interfaces for all entities
- `User`, `Service`, `Reservation`, `Review`, `Notification`

## 🗄️ Database Schemas

### User
```javascript
{
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: Enum ['client', 'provider', 'admin'],
  phone: String,
  preferences: Object,
  profileImage: String,
  isActive: Boolean,
  lastLogin: Date
}
```

### Service
```javascript
{
  name: String,
  description: String,
  category: String,
  providerId: ObjectId → User,
  basePrice: Number,
  images: [String],
  location: GeoJSON Point {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  address: String,
  openingHours: Object,
  slots: Array,
  avgRating: Number,
  reviewCount: Number,
  smartScore: Number,
  isActive: Boolean
}
```

### Reservation
```javascript
{
  clientId: ObjectId → User,
  serviceId: ObjectId → Service,
  startTime: Date,
  endTime: Date,
  status: Enum ['pending', 'confirmed', 'completed', 'cancelled', 'expired'],
  notes: String,
  isConfirmed: Boolean,
  expiresAt: Date (TTL index)
}
```

### Review
```javascript
{
  clientId: ObjectId → User,
  serviceId: ObjectId → Service,
  rating: Number (0-5),
  comment: String,
  isReported: Boolean,
  reportReason: String,
  helpfulCount: Number
}
```

### Notification
```javascript
{
  userId: ObjectId → User,
  type: Enum ['confirmation', 'reminder', 'expiration', 'offer', 'review_request'],
  title: String,
  message: String,
  reservationId: ObjectId → Reservation,
  isRead: Boolean,
  channels: [String],
  sentAt: Date
}
```

## 🔌 API Endpoints Reference

### Base URL: `http://localhost:3000/api`

#### Authentication
```
POST   /auth/register       - Register new user
POST   /auth/login          - User login
```

#### Services
```
GET    /services            - List all services
POST   /services            - Create new service
GET    /services/:id        - Get service details
GET    /services/nearby     - Get nearby services (query: lng, lat, distance)
PUT    /services/:id        - Update service
DELETE /services/:id        - Delete service
```

#### Search
```
GET    /search              - Search services (query: q, category, minPrice, maxPrice, minRating, sortBy)
GET    /search/smart-score/:serviceId - Calculate smart score
```

#### Reservations
```
POST   /reservations        - Create reservation
GET    /reservations/:id    - Get reservation details
GET    /reservations/client/:clientId - Get client's reservations
POST   /reservations/:id/confirm - Confirm reservation
POST   /reservations/:id/cancel  - Cancel reservation
```

#### Reviews
```
POST   /reviews             - Create review
GET    /reviews/service/:serviceId - Get service reviews
GET    /reviews/:id         - Get review details
POST   /reviews/:id/report  - Report review
GET    /reviews/service/:serviceId/rating - Get average rating
```

#### Notifications
```
GET    /notifications/user/:userId         - Get all notifications
GET    /notifications/user/:userId/unread  - Get unread notifications
POST   /notifications/:id/mark-as-read     - Mark as read
POST   /notifications/user/:userId/mark-all-as-read - Mark all as read
```

#### Dashboard
```
GET    /dashboard/provider/:providerId?period=month - Get provider statistics
```

#### AI
```
POST   /ai/chatbot          - Chat with AI
POST   /ai/speech-to-text   - Convert speech to text
POST   /ai/text-to-speech   - Convert text to speech
GET    /ai/recommendations/:userId - Get recommendations
```

## 🔐 Authentication Flow

1. User registers with email/password/role
2. Backend hashes password with bcrypt (cost 12)
3. User logs in with email/password
4. Backend returns `accessToken` (15min) + `refreshToken` (7 days)
5. Frontend stores tokens in localStorage
6. All requests include token in Authorization header: `Bearer {token}`

## 📍 Smart Ranking Algorithm

```
Score = (0.4 × rating_normalized) + 
         (0.3 × proximity_normalized) + 
         (0.2 × popularity_normalized) + 
         (0.1 × price_normalized_inverted)

All values normalized between 0 and 1
Recalculated every 6 hours via cron
```

## ⏱️ Reservation Timeout Logic

```
1. Reservation created → status: "pending"
2. Redis stores reservation with 10-minute TTL
3. After 10 minutes:
   - Redis key expires
   - Cron job checks and updates status to "expired"
   - Client slot becomes available again
4. If confirmed before timeout:
   - Status changes to "confirmed"
   - TTL updates to 24 hours
```

## 🔄 Typical User Flow - Client

1. **Discovery Phase**
   - Visit home page
   - Use search with filters
   - View services on map
   - Read reviews and ratings

2. **Booking Phase**
   - Select service
   - Choose date/time
   - Add notes
   - Submit reservation (pending)

3. **Confirmation Phase**
   - Receive confirmation email/notification
   - Click confirm link
   - Reservation confirmed

4. **Completion Phase**
   - Visit service
   - Leave review + rating
   - Service marked complete

## 🔄 Typical User Flow - Provider

1. **Setup Phase**
   - Register as provider
   - Create service listing
   - Add images, pricing, hours
   - Set availability slots

2. **Management Phase**
   - View incoming reservations
   - Confirm/manage bookings
   - Update availability

3. **Analytics Phase**
   - View dashboard statistics
   - Track revenue
   - Monitor ratings
   - Analyze cancellations

## 🛠️ Common Development Tasks

### Adding a New Endpoint

1. Update DTO in `modules/feature/dto/`
2. Add method to service: `modules/feature/feature.service.ts`
3. Add controller route: `modules/feature/feature.controller.ts`
4. Add API method in `frontend/lib/api/client.ts`
5. Update frontend hook if needed

### Adding a New Database Field

1. Update schema in `backend/src/database/schemas/`
2. Regenerate TypeScript types
3. Update DTO validation
4. Add migration if needed

### Testing an Endpoint

Use provided credentials from setup:
```
Client:   email: client@test.com, password: TestPassword123!
Provider: email: provider@test.com, password: TestPassword123!
```

Or use REST client (Postman, Thunder Client):
```
GET http://localhost:3000/api/services
Authorization: Bearer {your_access_token}
```

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Ensure `mongod` running or check Atlas connection string |
| Redis connection error | Ensure Redis running or use Redis Cloud |
| API 404 errors | Check backend running on 3000, verify endpoint paths |
| Frontend can't connect | Verify `NEXT_PUBLIC_API_URL` in `.env.local` |
| Mapbox not loading | Check token validity, ensure `h-96` height on map container |
| CORS errors | Check `FRONTEND_URL` in backend .env matches frontend URL |

## 📚 Useful Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [Mapbox Documentation](https://docs.mapbox.com)
- [JWT.io](https://jwt.io)
- [Tailwind CSS](https://tailwindcss.com)

## 💡 Performance Tips

1. **Database**: Use indexes (already set up for 2dsphere, TTL)
2. **Caching**: Redis for frequently accessed data
3. **Frontend**: Implement pagination for large lists
4. **Search**: Use MongoDB text search instead of filtering in memory
5. **Geolocation**: Cache nearby searches for 5-10 minutes

## 🎯 Next Priority Tasks

1. ✅ Core project structure
2. ✅ Database schemas
3. ⏳ Add JWT guards to protected routes
4. ⏳ Implement AI integrations
5. ⏳ Add WebSocket for real-time updates
6. ⏳ Payment processing
7. ⏳ Comprehensive testing
8. ⏳ Production deployment

---

**Happy Coding! 🚀**
