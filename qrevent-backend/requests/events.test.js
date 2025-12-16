const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Event = require('../models/event');
const User = require('../models/user');
const Category = require('../models/category');
const Inscription = require('../models/inscription');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');

describe('Events Controller Tests', () => {
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
      role: 'Participant'
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

  describe('GET /api/events', () => {
    it('devrait retourner tous les événements', async () => {
      await Event.create([
        {
          name: 'Event 1',
          description: 'Description 1',
          startDate: new Date(),
          city: 'Douala',
          category: testCategory._id,
          organizer: organizer._id
        },
        {
          name: 'Event 2',
          description: 'Description 2',
          startDate: new Date(),
          city: 'Yaoundé',
          category: testCategory._id,
          organizer: organizer._id
        }
      ]);

      const response = await request(app)
        .get('/api/events')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('organizer');
      expect(response.body[0]).toHaveProperty('category');
    });

    it('devrait retourner un tableau vide si aucun événement n\'existe', async () => {
      const response = await request(app)
        .get('/api/events')
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /api/events/:id', () => {
    it('devrait retourner un événement par ID', async () => {
      const event = await Event.create({
        name: 'Test Event',
        description: 'Test Description',
        startDate: new Date(),
        city: 'Douala',
        category: testCategory._id,
        organizer: organizer._id
      });

      const response = await request(app)
        .get(`/api/events/${event._id}`)
        .expect(200);

      expect(response.body.name).toBe('Test Event');
      expect(response.body.city).toBe('Douala');
    });

    it('devrait retourner 404 si l\'événement n\'existe pas', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/events/${fakeId}`)
        .expect(404);

      expect(response.body.error).toBe('Événement non trouvé.');
    });

    it('devrait retourner 400 pour un ID invalide', async () => {
      const response = await request(app)
        .get('/api/events/invalidid')
        .expect(400);

      expect(response.body.error).toBe('ID d\'événement invalide.');
    });
  });

  describe('POST /api/events', () => {
    it('devrait créer un nouvel événement', async () => {
      const eventData = {
        name: 'Nouveau Event',
        description: 'Description de l\'événement',
        startDate: new Date(),
        city: 'Douala',
        category: testCategory._id.toString(),
        price: 5000
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(eventData)
        .expect(201);

      expect(response.body.name).toBe(eventData.name);
      expect(response.body.organizer).toBe(organizer._id.toString());

      const savedEvent = await Event.findById(response.body._id);
      expect(savedEvent).toBeTruthy();
    });

    it('devrait retourner 401 si non authentifié', async () => {
      const eventData = {
        name: 'Nouveau Event',
        description: 'Description',
        startDate: new Date(),
        city: 'Douala',
        category: testCategory._id.toString()
      };

      await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(401);
    });

    it('devrait retourner 400 si la catégorie est invalide', async () => {
      const eventData = {
        name: 'Nouveau Event',
        description: 'Description',
        startDate: new Date(),
        city: 'Douala',
        category: 'invalidid'
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(eventData)
        .expect(400);

      expect(response.body.error).toBe('Catégorie invalide.');
    });
  });

  describe('PUT /api/events/:id', () => {
    it('devrait mettre à jour un événement par son organisateur', async () => {
      const event = await Event.create({
        name: 'Event Original',
        description: 'Description',
        startDate: new Date(),
        city: 'Douala',
        category: testCategory._id,
        organizer: organizer._id
      });

      const updateData = {
        name: 'Event Modifié',
        description: 'Nouvelle description'
      };

      const response = await request(app)
        .put(`/api/events/${event._id}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('Event Modifié');
      expect(response.body.description).toBe('Nouvelle description');
    });

    it('devrait retourner 403 si l\'utilisateur n\'est pas l\'organisateur', async () => {
      const event = await Event.create({
        name: 'Event Original',
        description: 'Description',
        startDate: new Date(),
        city: 'Douala',
        category: testCategory._id,
        organizer: organizer._id
      });

      const response = await request(app)
        .put(`/api/events/${event._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Event Modifié' })
        .expect(403);

      expect(response.body.error).toBe('Action non autorisée.');
    });

    it('devrait permettre à un admin de modifier n\'importe quel événement', async () => {
      const event = await Event.create({
        name: 'Event Original',
        description: 'Description',
        startDate: new Date(),
        city: 'Douala',
        category: testCategory._id,
        organizer: organizer._id
      });

      const response = await request(app)
        .put(`/api/events/${event._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Event Modifié par Admin' })
        .expect(200);

      expect(response.body.name).toBe('Event Modifié par Admin');
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('devrait supprimer un événement par son organisateur', async () => {
      const event = await Event.create({
        name: 'Event à Supprimer',
        description: 'Description',
        startDate: new Date(),
        city: 'Douala',
        category: testCategory._id,
        organizer: organizer._id
      });

      await request(app)
        .delete(`/api/events/${event._id}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(204);

      const deletedEvent = await Event.findById(event._id);
      expect(deletedEvent).toBeNull();
    });

    it('devrait retourner 403 si l\'utilisateur n\'est pas l\'organisateur', async () => {
      const event = await Event.create({
        name: 'Event',
        description: 'Description',
        startDate: new Date(),
        city: 'Douala',
        category: testCategory._id,
        organizer: organizer._id
      });

      const response = await request(app)
        .delete(`/api/events/${event._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.error).toBe('Action non autorisée.');
    });
  });

  describe('POST /api/events/:id/register', () => {
    it('devrait inscrire un utilisateur à un événement', async () => {
      const event = await Event.create({
        name: 'Event',
        description: 'Description',
        startDate: new Date(),
        city: 'Douala',
        category: testCategory._id,
        organizer: organizer._id,
        qrOption: false
      });

      const response = await request(app)
        .post(`/api/events/${event._id}/register`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(201);

      expect(response.body.message).toBe('Inscription réussie');

      const updatedEvent = await Event.findById(event._id);
      expect(updatedEvent.participants).toContainEqual(testUser._id);
    });

    it('devrait retourner 400 si l\'utilisateur est déjà inscrit', async () => {
      const event = await Event.create({
        name: 'Event',
        description: 'Description',
        startDate: new Date(),
        city: 'Douala',
        category: testCategory._id,
        organizer: organizer._id,
        participants: [testUser._id]
      });

      const response = await request(app)
        .post(`/api/events/${event._id}/register`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Vous êtes déjà inscrit.');
    });

    it('devrait générer un QR code si l\'option est activée', async () => {
      const event = await Event.create({
        name: 'Event',
        description: 'Description',
        startDate: new Date(),
        city: 'Douala',
        category: testCategory._id,
        organizer: organizer._id,
        qrOption: true
      });

      const response = await request(app)
        .post(`/api/events/${event._id}/register`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nom: testUser.nom,
          email: testUser.email,
          profession: 'Développeur'
        })
        .expect(201);

      expect(response.body).toHaveProperty('qrCode');
      expect(response.body.qrCode).toBeTruthy();
    });
  });

  describe('DELETE /api/events/:id/unregister', () => {
    it('devrait désinscrire un utilisateur d\'un événement', async () => {
      const event = await Event.create({
        name: 'Event',
        description: 'Description',
        startDate: new Date(),
        city: 'Douala',
        category: testCategory._id,
        organizer: organizer._id,
        participants: [testUser._id]
      });

      await request(app)
        .delete(`/api/events/${event._id}/unregister`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      const updatedEvent = await Event.findById(event._id);
      expect(updatedEvent.participants).not.toContainEqual(testUser._id);
    });
  });

  describe('POST /api/events/:id/participants', () => {
    it('devrait permettre à l\'organisateur d\'ajouter un participant', async () => {
      const event = await Event.create({
        name: 'Event',
        description: 'Description',
        startDate: new Date(),
        city: 'Douala',
        category: testCategory._id,
        organizer: organizer._id,
        qrOption: false
      });

      const response = await request(app)
        .post(`/api/events/${event._id}/participants`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({ participantId: testUser._id.toString() })
        .expect(200);

      expect(response.body.participants).toBeDefined();
      const participantIds = response.body.participants.map(p => p._id);
      expect(participantIds).toContain(testUser._id.toString());
    });

    it('devrait retourner 403 si l\'utilisateur n\'est pas l\'organisateur', async () => {
      const event = await Event.create({
        name: 'Event',
        description: 'Description',
        startDate: new Date(),
        city: 'Douala',
        category: testCategory._id,
        organizer: organizer._id
      });

      const response = await request(app)
        .post(`/api/events/${event._id}/participants`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ participantId: testUser._id.toString() })
        .expect(403);

      expect(response.body.error).toBe('Accès interdit. Droits insuffisants.');
    });
  });

  describe('DELETE /api/events/:id/participants/:participantId', () => {
    it('devrait permettre à l\'organisateur de retirer un participant', async () => {
      const event = await Event.create({
        name: 'Event',
        description: 'Description',
        startDate: new Date(),
        city: 'Douala',
        category: testCategory._id,
        organizer: organizer._id,
        participants: [testUser._id]
      });

      await request(app)
        .delete(`/api/events/${event._id}/participants/${testUser._id}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(204);

      const updatedEvent = await Event.findById(event._id);
      expect(updatedEvent.participants).not.toContainEqual(testUser._id);
    });
  });

  describe('GET /api/events/organizer/me', () => {
    it('devrait retourner tous les événements de l\'organisateur', async () => {
      await Event.create([
        {
          name: 'Event 1',
          description: 'Description 1',
          startDate: new Date(),
          city: 'Douala',
          category: testCategory._id,
          organizer: organizer._id
        },
        {
          name: 'Event 2',
          description: 'Description 2',
          startDate: new Date(),
          city: 'Yaoundé',
          category: testCategory._id,
          organizer: organizer._id
        }
      ]);

      const response = await request(app)
        .get('/api/events/organizer/me')
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /api/events/:id/validated-attendees', () => {
    it('devrait retourner les participants validés', async () => {
      const event = await Event.create({
        name: 'Event',
        description: 'Description',
        startDate: new Date(),
        city: 'Douala',
        category: testCategory._id,
        organizer: organizer._id,
        participants: [testUser._id]
      });

      await Inscription.create({
        event: event._id,
        participant: testUser._id,
        isValidated: true,
        qrCodeToken: 'token123',
        qrCodeImage: 'data:image/png;base64,test'
      });

      const response = await request(app)
        .get(`/api/events/${event._id}/validated-attendees`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]._id).toBe(testUser._id.toString());
    });

    it('devrait retourner 403 si l\'utilisateur n\'est pas l\'organisateur', async () => {
      const event = await Event.create({
        name: 'Event',
        description: 'Description',
        startDate: new Date(),
        city: 'Douala',
        category: testCategory._id,
        organizer: organizer._id
      });

      const response = await request(app)
        .get(`/api/events/${event._id}/validated-attendees`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.error).toBe('Accès interdit. Droits insuffisants.');
    });
  });
});
