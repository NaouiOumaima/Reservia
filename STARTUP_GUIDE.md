# 🚀 Guide de Démarrage Complet - Notifications en Temps Réel

## 📋 Prérequis

- Node.js (v16+)
- MongoDB (local ou Atlas)
- Redis (local ou cloud)
- Un navigateur moderne (Chrome, Firefox, Safari)

## 🔧 Étape 1: Installation des Dépendances

### Backend
```bash
cd backend

# Installer toutes les dépendances
npm install

# Installer les paquets Socket.IO
npm install @nestjs/websockets socket.io
```

### Frontend
```bash
cd frontend

# Installer toutes les dépendances
npm install

# Installer socket.io-client
npm install socket.io-client
```

## ⚙️ Étape 2: Configuration des Variables d'Environnement

### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Éditer `.env`:
```
# Database - NOM: Reservation
MONGODB_URI=mongodb://localhost:27017/Reservation

# ou MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Reservation

# JWT
JWT_SECRET=your-super-secret-key-min-32-characters-long

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Frontend CORS
FRONTEND_URL=http://localhost:3001

# Autres (optionnel pour maintenant)
PORT=3000
```

### Frontend (.env.local)
```bash
cd frontend
cp .env.example .env.local
```

Éditer `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_MAPBOX_TOKEN=your-token-here
```

## 🗄️ Étape 3: Configuration de la Base de Données

### Option A: MongoDB Local
```bash
# Windows
mongod

# ou macOS
brew services start mongodb-community

# ou Linux
sudo systemctl start mongod
```

Vérifier la connexion:
```bash
mongosh
> use Reservation
> db.users.find()
```

### Option B: MongoDB Atlas (Cloud)
1. Créer un compte sur https://mongodb.com/cloud/atlas
2. Créer un cluster gratuit
3. Créer une base de données nommée "Reservation"
4. Générer une connection string
5. Remplacer dans `.env`

## 🔴 Étape 4: Configuration de Redis

### Option A: Redis Local
```bash
# Windows (WSL)
redis-server

# macOS
brew services start redis

# Linux
sudo systemctl start redis-server
```

Vérifier:
```bash
redis-cli
> PING
# Réponse: PONG
```

### Option B: Redis Cloud
1. Créer un compte sur https://redis.com/try-free/
2. Créer une instance
3. Utiliser les credentials dans `.env`

## ▶️ Étape 5: Démarrage de l'Application

### Terminal 1: Backend (Port 3000)
```bash
cd backend
npm run start:dev

# Vous devriez voir:
# [NestFactory] Starting Nest application...
# [InstanceLoader] TypeOrmModule dependencies initialized
# [RoutesResolver] AppController {/}
# ✅ WebSocket Notifications Gateway initialized
# Server is running on port 3000
```

### Terminal 2: Frontend (Port 3001)
```bash
cd frontend
npm run dev

# Vous devriez voir:
# ▲ Next.js 14.x.x
# - Local: http://localhost:3001
# ✓ Ready in 2.5s
```

## 🧪 Étape 6: Test de l'Application

### 1. Accéder au Frontend
Ouvrir: http://localhost:3001

### 2. S'inscrire
- Cliquer sur "Sign up"
- Remplir le formulaire
- Rôle: "Client"
- Cliquer sur "Sign up"

```
Email: client@test.com
Password: TestPassword123!
First Name: Jean
Last Name: Dupont
Role: Client
```

### 3. Vérifier la Connexion WebSocket
Ouvrir la Console du Navigateur (F12):
```
✅ Connected to notifications
📢 User {userId} subscribed to notifications
```

### 4. Tester les Notifications

#### Créer une Réservation
1. Aller sur "Search Services"
2. Chercher un service
3. Cliquer sur un service
4. Remplir le formulaire de réservation
5. Cliquer sur "Reserve Now"

Vous devriez voir:
```
⏳ Pending (en attente)
📨 Nouvelle notification reçue en temps réel
```

#### Centre de Notifications
1. Cliquer sur la cloche 🔔 en bas à droite
2. Voir les notifications en temps réel
3. Badge avec nombre de notifications

### 5. Tester Depuis le Terminal (Optionnel)

Créer une réservation via API:
```bash
# Dans un 3e terminal
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "serviceId": "SERVICE_ID",
    "startTime": "2026-04-24T14:00:00Z",
    "endTime": "2026-04-24T15:00:00Z"
  }'
```

## 📊 Étapes Supplémentaires: Flux Complet

### 1. Mode Provider (Fournisseur)
```bash
# Créer un compte provider
Email: provider@test.com
Role: Provider
```

### 2. Créer un Service
1. Se connecter en tant que provider
2. Aller au dashboard
3. Créer un nouveau service
4. Remplir les détails
5. Sauvegarder

### 3. Voir les Réservations
1. Aller sur le dashboard provider
2. Voir les réservations en temps réel
3. Confirmer/Annuler une réservation
4. Les clients reçoivent la mise à jour IMMÉDIATEMENT

## 🔍 Debugging

### Logs du Backend
```bash
# Terminal 1 - Backend
# Regarder les logs pour:
✅ WebSocket Notifications Gateway initialized
✅ User {userId} connected with socket {socketId}
📨 Notification sent to user {userId}
```

### Logs du Frontend (Console Navigateur)
```javascript
// F12 → Console
✅ Connected to notifications
📨 New notification: {...}
🔔 Reservation updated: {...}
```

### Vérifier la Connexion MongoDB
```bash
mongosh
> show databases
# Vous devriez voir "Reservation"

> use Reservation
> show collections
# Vous devriez voir: users, services, reservations, reviews, notifications
```

### Vérifier la Connexion Redis
```bash
redis-cli
> KEYS *
# Vous devriez voir les clés de réservations: reservation:{id}
```

## 🆘 Troubleshooting

| Problème | Solution |
|----------|----------|
| Connection refused (MongoDB) | Vérifier que mongod est en cours d'exécution |
| Connection refused (Redis) | Vérifier que redis-server est en cours d'exécution |
| WebSocket refuses to connect | Vérifier FRONTEND_URL dans .env backend |
| No notifications appearing | Ouvrir Console (F12) et vérifier les logs |
| Port 3000 already in use | Terminer le processus: `lsof -i :3000` |
| Port 3001 already in use | Terminer le processus: `lsof -i :3001` |

## 📱 Tester sur Mobile

### Accéder depuis votre téléphone
1. Obtenez l'adresse IP de votre machine:
   ```bash
   # Windows
   ipconfig
   # Cherchez IPv4 Address
   
   # macOS/Linux
   ifconfig
   ```

2. Accédez depuis le téléphone:
   ```
   http://YOUR_IP:3001
   ```

3. Les WebSockets fonctionneront normalement!

## 🎬 Démonstration Vidéo

### Scénario: Réservation en Temps Réel

**Temps: 0-2 min** - Configuration
- Ouvrir 2 onglets: Client et Provider
- Se connecter en tant que client dans l'onglet 1
- Se connecter en tant que provider dans l'onglet 2

**Temps: 2-4 min** - Réservation
- Client: Chercher un service
- Client: Faire une réservation
- Voir notification immédiate ✅

**Temps: 4-6 min** - Confirmation
- Provider: Voir la réservation
- Provider: Cliquer "Confirmer"
- Client: Recevoir la notification de confirmation

**Temps: 6-8 min** - Mise à Jour
- Les deux voient l'update en temps réel 🚀

## ✅ Checklist de Vérification

- [ ] MongoDB est en cours d'exécution
- [ ] Redis est en cours d'exécution
- [ ] Backend démarre sans erreurs
- [ ] Frontend se connecte au backend
- [ ] WebSocket se connecte (cloche verte)
- [ ] Les notifications apparaissent en temps réel
- [ ] Réservations se mettent à jour en direct
- [ ] Console n'a pas d'erreurs

## 📞 Support et Ressources

### Commandes Utiles

```bash
# Voir les ports en utilisation
lsof -i :3000
lsof -i :3001

# Terminer un processus
kill -9 PID

# Vérifier MongoDB
mongosh --eval "db.version()"

# Vérifier Redis
redis-cli ping
```

### Documentation
- Backend: `DEVELOPER_GUIDE.md`
- WebSocket: `SOCKET_IO_SETUP.md`
- Résumé: `REALTIME_NOTIFICATIONS_SUMMARY.md`

## 🎉 Félicitations!

Vous avez maintenant:
✅ MongoDB "Reservation" configuré
✅ Socket.IO pour notifications en temps réel
✅ Frontend avec WebSocket
✅ Backend avec NestJS WebSocket Gateway
✅ Réservations avec mises à jour en direct

---

**Prêt à développer! 🚀**

Date: April 23, 2026
