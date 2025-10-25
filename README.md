# 🔔 SadTrans Push Notification Server

Serveur Node.js pour les notifications push de l'application SadTrans utilisant la bibliothèque `web-push` avec chiffrement automatique.

## 🚀 Démarrage rapide

### Installation
```bash
npm install
```

### Configuration
```bash
# Générer les clés VAPID
npm run generate-keys

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec les clés générées
```

### Développement
```bash
npm run dev
```

### Production
```bash
npm start
```

## 📡 Endpoints

- `GET /health` - Health check
- `GET /vapid-public-key` - Obtenir la clé publique VAPID
- `POST /send-push` - Envoyer une notification
- `POST /send-push-batch` - Envoyer en batch

## 🌐 Déploiement

### Railway (Recommandé)
```bash
railway login
railway init
railway variables set VAPID_PUBLIC_KEY="votre_cle_publique"
railway variables set VAPID_PRIVATE_KEY="votre_cle_privee"
railway variables set VAPID_EMAIL="mailto:admin@sadtrans.com"
railway up
```

### Render
1. Connecter le repo GitHub
2. Configurer les variables d'environnement
3. Déployer

## 🔧 Variables d'environnement

```env
PORT=3000
VAPID_PUBLIC_KEY=votre_cle_publique_vapid
VAPID_PRIVATE_KEY=votre_cle_privee_vapid
VAPID_EMAIL=mailto:admin@sadtrans.com
```

## 📚 Documentation

- [Guide de déploiement](DEPLOYMENT.md)
- [Démarrage rapide](QUICKSTART.md)

## 🏗️ Architecture

```
Client (SadTrans App)
    ↓
Supabase Edge Function
    ↓
Ce serveur Node.js (web-push)
    ↓
FCM/Mozilla Push Service
    ↓
Navigateur (notification)
```

## 🔒 Sécurité

- Chiffrement automatique des notifications
- Clés VAPID sécurisées
- HTTPS obligatoire en production
- Validation des données

## 📊 Monitoring

- Logs détaillés
- Health check endpoint
- Gestion des erreurs (410, 404, 401)
- Nettoyage automatique des subscriptions expirées

## 🤝 Contribution

Ce serveur fait partie de l'écosystème SadTrans. Pour contribuer :

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Propriétaire - SadTrans © 2024