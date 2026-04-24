# Socket.IO Installation & Setup Guide

## 📦 Installation des dépendances

### Backend (NestJS)

```bash
cd backend

# Installer Socket.IO et ses dépendances
npm install @nestjs/websockets socket.io

# Optionnel: pour les features avancées
npm install socket.io-redis @socket.io/redis-adapter
```

### Frontend (Next.js)

```bash
cd frontend

# Installer Socket.IO Client
npm install socket.io-client
```

## ✅ Configuration effectuée

### Backend Changes
- ✅ `src/modules/websocket/notifications.gateway.ts` - WebSocket Gateway avec Socket.IO
- ✅ `src/modules/websocket/websocket.module.ts` - Module WebSocket
- ✅ `src/modules/notifications/notifications.service.ts` - Intégration WebSocket
- ✅ `src/modules/notifications/notifications.module.ts` - Import WebSocketModule
- ✅ `src/app.module.ts` - Import du WebSocketModule
- ✅ Database MongoDB: "Reservation"

### Frontend Changes
- ✅ `lib/hooks/useNotifications.ts` - Custom hook pour Socket.IO
- ✅ `app/components/RealtimeNotificationCenter.tsx` - Composant de notification en temps réel
- ✅ `app/layout.tsx` - Intégration du composant

## 🚀 Démarrage

### Backend
```bash
cd backend
npm run start:dev
```
Le server WebSocket écoutera sur `ws://localhost:3000/notifications`

### Frontend
```bash
cd frontend
npm run dev
```
La connexion WebSocket se fera automatiquement avec l'userId.

## 🔌 Architecture WebSocket

### Namespaces
```
/notifications - Pour les notifications en temps réel
```

### Rooms
```
user:{userId} - Notifications spécifiques à un utilisateur
service:{serviceId} - Mises à jour de service
```

### Events

#### Client → Server
```
notification:subscribe   - S'abonner aux notifications (userId)
notification:unsubscribe - Se désabonner des notifications (userId)
```

#### Server → Client
```
notification:new        - Nouvelle notification
reservation:updated     - Mise à jour de réservation
service:updated         - Mise à jour de service
user:online            - Utilisateur en ligne
user:offline           - Utilisateur hors ligne
```

## 📊 Flux de Notification en Temps Réel

### Exemple 1: Nouvelle notification
```
1. Backend crée une notification via NotificationsService.create()
2. Service appelle gateway.sendNotificationToUser()
3. Gateway émet 'notification:new' au client
4. Client reçoit l'événement et met à jour l'UI
```

### Exemple 2: Mise à jour de réservation
```
1. Backend confirme une réservation
2. Gateway appelle sendReservationUpdate()
3. Gateway émet 'reservation:updated' à tous les clients
4. Frontend reçoit et affiche la mise à jour
```

## 💻 Utilisation du Hook

### Dans un composant
```tsx
import { useNotifications } from '@/lib/hooks/useNotifications';

export default function MyComponent() {
  const userId = '123abc'; // Du localStorage
  const { 
    notifications, 
    isConnected, 
    unreadCount, 
    markAsRead 
  } = useNotifications(userId);

  return (
    <div>
      {isConnected && <span>✓ Connecté</span>}
      <p>Messages non lus: {unreadCount}</p>
    </div>
  );
}
```

## 🔐 Sécurité

### CORS Configuration
Le Gateway accepte les connexions depuis:
```
http://localhost:3001  (développement)
${process.env.FRONTEND_URL} (production)
```

### Query Parameters
Les connexions doivent passer `userId`:
```javascript
io('ws://localhost:3000', {
  query: { userId: 'user-id' },
  namespace: '/notifications'
})
```

## 📈 Performance

### Optimisations
- Utilisation des Rooms pour les notifications ciblées
- Reconnexion automatique
- Gestion des disconnexions gracieuses
- Logs pour le debugging

### Scaling (Production)
Pour le scaling horizontal, utiliser Redis adapter:
```bash
npm install @socket.io/redis-adapter redis
```

```typescript
// Dans le gateway
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient();
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

## 🧪 Testing

### Test avec WebSocket Client
```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
  query: { userId: 'test-user' },
  namespace: '/notifications'
});

socket.on('connect', () => {
  console.log('✓ Connecté');
  socket.emit('notification:subscribe', { userId: 'test-user' });
});

socket.on('notification:new', (data) => {
  console.log('📨 Notification:', data);
});
```

## 🛠️ Troubleshooting

### Connexion refused
- Vérifier que le backend s'exécute sur port 3000
- Vérifier les paramètres CORS
- Vérifier que Socket.IO est importé dans app.module

### Pas de notifications reçues
- Vérifier que `userId` est correct
- Vérifier que le frontend se connecte à la bonne URL
- Vérifier les logs du serveur

### Reconnexion infinie
- Vérifier la stabilité de la connexion
- Augmenter les timeouts si nécessaire
- Vérifier les logs pour les erreurs

## 📚 Ressources

- [NestJS WebSockets Documentation](https://docs.nestjs.com/websockets/gateways)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Socket.IO Client Documentation](https://socket.io/docs/client-api)

## 🎯 Étapes Suivantes

1. ✅ Installer les dépendances
2. ✅ Tester la connexion WebSocket
3. ⏳ Intégrer réservations en temps réel
4. ⏳ Ajouter les mises à jour de disponibilité
5. ⏳ Implémenter le chat en direct
6. ⏳ Ajouter les notifications push

---

**Configuration Socket.IO complète et prête pour le développement! 🚀**
