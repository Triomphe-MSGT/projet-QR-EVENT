const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');

describe('Notification Controller Tests', () => {
  let authToken;
  let testUser;
  let otherUser;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qrevent-test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Notification.deleteMany({});

    // Créer un utilisateur de test
    testUser = await User.create({
      nom: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
      role: 'Participant'
    });
    authToken = jwt.sign({ id: testUser._id, role: testUser.role }, config.JWT_SECRET);

    // Créer un autre utilisateur
    otherUser = await User.create({
      nom: 'Other User',
      email: 'other@example.com',
      passwordHash: 'hashedpassword',
      role: 'Organisateur'
    });
  });

  describe('GET /api/notifications', () => {
    it('devrait retourner toutes les notifications de l\'utilisateur', async () => {
      // Créer des notifications pour l'utilisateur de test
      await Notification.create([
        {
          user: testUser._id,
          sender: otherUser._id,
          message: 'Notification 1',
          link: '/events/1'
        },
        {
          user: testUser._id,
          sender: otherUser._id,
          message: 'Notification 2',
          link: '/events/2'
        }
      ]);

      // Créer une notification pour un autre utilisateur (ne devrait pas être retournée)
      await Notification.create({
        user: otherUser._id,
        sender: testUser._id,
        message: 'Notification for other user',
        link: '/events/3'
      });

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('message');
      expect(response.body[0]).toHaveProperty('link');
      expect(response.body[0]).toHaveProperty('isRead');
    });

    it('devrait retourner un tableau vide si aucune notification n\'existe', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(0);
    });

    it('devrait retourner les notifications triées par date (plus récentes en premier)', async () => {
      const now = new Date();
      
      await Notification.create([
        {
          user: testUser._id,
          sender: otherUser._id,
          message: 'Old Notification',
          link: '/events/1',
          createdAt: new Date(now.getTime() - 86400000) // 1 jour avant
        },
        {
          user: testUser._id,
          sender: otherUser._id,
          message: 'Recent Notification',
          link: '/events/2',
          createdAt: now
        }
      ]);

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].message).toBe('Recent Notification');
      expect(response.body[1].message).toBe('Old Notification');
    });

    it('devrait limiter à 20 notifications', async () => {
      // Créer 25 notifications
      const notifications = [];
      for (let i = 0; i < 25; i++) {
        notifications.push({
          user: testUser._id,
          sender: otherUser._id,
          message: `Notification ${i}`,
          link: `/events/${i}`
        });
      }
      await Notification.create(notifications);

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(20);
    });
  });

  describe('POST /api/notifications/read', () => {
    it('devrait marquer toutes les notifications comme lues', async () => {
      await Notification.create([
        {
          user: testUser._id,
          sender: otherUser._id,
          message: 'Notification 1',
          link: '/events/1',
          isRead: false
        },
        {
          user: testUser._id,
          sender: otherUser._id,
          message: 'Notification 2',
          link: '/events/2',
          isRead: false
        }
      ]);

      const response = await request(app)
        .post('/api/notifications/read')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Toutes les notifications ont été marquées comme lues.');

      const notifications = await Notification.find({ user: testUser._id });
      notifications.forEach(notif => {
        expect(notif.isRead).toBe(true);
      });
    });

    it('ne devrait affecter que les notifications de l\'utilisateur connecté', async () => {
      await Notification.create([
        {
          user: testUser._id,
          sender: otherUser._id,
          message: 'User 1 Notification',
          link: '/events/1',
          isRead: false
        },
        {
          user: otherUser._id,
          sender: testUser._id,
          message: 'User 2 Notification',
          link: '/events/2',
          isRead: false
        }
      ]);

      await request(app)
        .post('/api/notifications/read')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const user1Notifications = await Notification.find({ user: testUser._id });
      const user2Notifications = await Notification.find({ user: otherUser._id });

      expect(user1Notifications[0].isRead).toBe(true);
      expect(user2Notifications[0].isRead).toBe(false);
    });

    it('devrait fonctionner même s\'il n\'y a pas de notifications non lues', async () => {
      await Notification.create({
        user: testUser._id,
        sender: otherUser._id,
        message: 'Already Read',
        link: '/events/1',
        isRead: true
      });

      const response = await request(app)
        .post('/api/notifications/read')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Toutes les notifications ont été marquées comme lues.');
    });
  });

  describe('Authentication', () => {
    it('devrait retourner 401 si non authentifié', async () => {
      await request(app)
        .get('/api/notifications')
        .expect(401);
    });

    it('devrait retourner 401 avec un token invalide', async () => {
      await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);
    });

    it('devrait retourner 401 pour POST /read si non authentifié', async () => {
      await request(app)
        .post('/api/notifications/read')
        .expect(401);
    });
  });
});
