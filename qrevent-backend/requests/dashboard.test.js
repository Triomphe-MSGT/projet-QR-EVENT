const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
const Event = require('../models/event');
const Category = require('../models/category');
const Inscription = require('../models/inscription');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');

describe('Dashboard Controller Tests', () => {
  let authToken;
  let organizerToken;
  let adminToken;
  let testUser;
  let organizer;
  let admin;
  let testCategory;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qrevent-test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Event.deleteMany({});
    await User.deleteMany({});
    await Category.deleteMany({});
    await Inscription.deleteMany({});

    // Créer un participant
    testUser = await User.create({
      nom: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
      role: 'Participant',
      sexe: 'Homme'
    });
    authToken = jwt.sign({ id: testUser._id, role: testUser.role }, config.JWT_SECRET);

    // Créer un organisateur
    organizer = await User.create({
      nom: 'Organizer User',
      email: 'organizer@example.com',
      passwordHash: 'hashedpassword',
      role: 'Organisateur'
    });
    organizerToken = jwt.sign({ id: organizer._id, role: organizer.role }, config.JWT_SECRET);

    // Créer un admin
    admin = await User.create({
      nom: 'Admin User',
      email: 'admin@example.com',
      passwordHash: 'hashedpassword',
      role: 'Administrateur'
    });
    adminToken = jwt.sign({ id: admin._id, role: admin.role }, config.JWT_SECRET);

    // Créer une catégorie de test
    testCategory = await Category.create({
      name: 'Conférence',
      emoji: '🎤',
      description: 'Événements de conférence'
    });
  });

  describe('GET /api/dashboard/organizer-stats', () => {
    it('devrait retourner les statistiques pour un organisateur', async () => {
      // Créer des événements pour l'organisateur
      const event1 = await Event.create({
        name: 'Event 1',
        description: 'Description',
        startDate: new Date(),
        city: 'Douala',
        category: testCategory._id,
        organizer: organizer._id,
        participants: [testUser._id]
      });

      const event2 = await Event.create({
        name: 'Event 2',
        description: 'Description',
        startDate: new Date(),
        city: 'Yaoundé',
        category: testCategory._id,
        organizer: organizer._id,
        participants: []
      });

      // Créer des inscriptions
      await Inscription.create({
        event: event1._id,
        participant: testUser._id,
        isValidated: true,
        qrCodeToken: 'token123',
        qrCodeImage: 'data:image/png;base64,test'
      });

      const response = await request(app)
        .get('/api/dashboard/organizer-stats')
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalEvents');
      expect(response.body).toHaveProperty('totalRegistrations');
      expect(response.body).toHaveProperty('qrValidated');
      expect(response.body.totalEvents).toBe(2);
      expect(response.body.totalRegistrations).toBe(1);
      expect(response.body.qrValidated).toBe(1);
    });

    it('devrait retourner 0 si l\'organisateur n\'a pas d\'événements', async () => {
      const response = await request(app)
        .get('/api/dashboard/organizer-stats')
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200);

      expect(response.body.totalEvents).toBe(0);
      expect(response.body.totalRegistrations).toBe(0);
      expect(response.body.qrValidated).toBe(0);
    });
  });

  describe('GET /api/dashboard/admin-stats', () => {
    it('devrait retourner les statistiques globales pour un admin', async () => {
      // Créer des événements de différents organisateurs
      await Event.create([
        {
          name: 'Event 1',
          description: 'Description',
          startDate: new Date(),
          city: 'Douala',
          category: testCategory._id,
          organizer: organizer._id,
          participants: [testUser._id]
        },
        {
          name: 'Event 2',
          description: 'Description',
          startDate: new Date(),
          city: 'Yaoundé',
          category: testCategory._id,
          organizer: admin._id,
          participants: []
        }
      ]);

      const response = await request(app)
        .get('/api/dashboard/admin-stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('participantCount');
      expect(response.body).toHaveProperty('organizerCount');
      expect(response.body).toHaveProperty('adminCount');
      expect(response.body).toHaveProperty('totalEvents');
      expect(response.body).toHaveProperty('totalRegistrations');
      expect(response.body).toHaveProperty('qrValidated');
      expect(response.body).toHaveProperty('avgPerEvent');
      expect(response.body.totalEvents).toBeGreaterThanOrEqual(2);
      expect(response.body.totalUsers).toBeGreaterThanOrEqual(3);
    });

    it('devrait retourner 403 si l\'utilisateur n\'est pas admin', async () => {
      const response = await request(app)
        .get('/api/dashboard/admin-stats')
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(403);

      expect(response.body.error).toBe('Accès interdit. Droits insuffisants.');
    });
  });

  describe('GET /api/dashboard/admin-report', () => {
    it('devrait générer un rapport CSV pour un admin', async () => {
      const response = await request(app)
        .get('/api/dashboard/admin-report')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.text).toContain('RAPPORT GLOBAL QR-EVENT');
    });

    it('devrait retourner 403 si l\'utilisateur n\'est pas admin', async () => {
      const response = await request(app)
        .get('/api/dashboard/admin-report')
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(403);

      expect(response.body.error).toBe('Accès interdit. Droits insuffisants.');
    });
  });

  describe('Authentication & Authorization', () => {
    it('devrait retourner 401 si non authentifié', async () => {
      await request(app)
        .get('/api/dashboard/organizer-stats')
        .expect(401);
    });

    it('devrait retourner 403 si l\'utilisateur est un simple participant', async () => {
      const response = await request(app)
        .get('/api/dashboard/organizer-stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.error).toBe('Accès interdit. Droits insuffisants.');
    });
  });
});
