const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = require('../app');
const User = require('../models/user');
const Event = require('../models/event');
const Inscription = require('../models/inscription');
const Category = require('../models/category');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');

describe('User Controller Tests', () => {
  let authToken;
  let adminToken;
  let testUser;
  let admin;

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
    await Event.deleteMany({});
    await Inscription.deleteMany({});

    // Créer un utilisateur de test
    testUser = await User.create({
      nom: 'Test User',
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'Participant'
    });
    authToken = jwt.sign({ id: testUser._id, role: testUser.role }, config.JWT_SECRET);

    // Créer un admin
    admin = await User.create({
      nom: 'Admin User',
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('adminpass', 10),
      role: 'Administrateur'
    });
    adminToken = jwt.sign({ id: admin._id, role: admin.role }, config.JWT_SECRET);
  });

  describe('GET /api/users', () => {
    it('devrait retourner tous les utilisateurs', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body[0]).not.toHaveProperty('passwordHash');
    });
  });

  describe('GET /api/users/:id', () => {
    it('devrait retourner un utilisateur par ID', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.nom).toBe('Test User');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('devrait retourner 404 si l\'utilisateur n\'existe pas', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.error).toBe('Utilisateur non trouvé');
    });
  });

  describe('POST /api/users', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const userData = {
        nom: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'Participant',
        sexe: 'Homme',
        profession: 'Développeur',
        phone: '123456789'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body.nom).toBe(userData.nom);
      expect(response.body.email).toBe(userData.email);
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('devrait retourner 400 si l\'email existe déjà', async () => {
      const userData = {
        nom: 'Duplicate User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Cet email est déjà utilisé.');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('devrait permettre à un admin de modifier un profil', async () => {
      const updateData = {
        nom: 'Updated Name',
        profession: 'Ingénieur'
      };

      const response = await request(app)
        .put(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.nom).toBe('Updated Name');
      expect(response.body.profession).toBe('Ingénieur');
    });

    it('devrait retourner 403 si un participant essaie de modifier un profil', async () => {
      const otherUser = await User.create({
        nom: 'Other User',
        email: 'other@example.com',
        passwordHash: 'hashedpassword',
        role: 'Participant'
      });

      const response = await request(app)
        .put(`/api/users/${otherUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nom: 'Hacked Name' })
        .expect(403);

      expect(response.body.error).toBe('Accès interdit. Droits insuffisants.');
    });

    it('devrait retourner 404 si l\'utilisateur n\'existe pas', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nom: 'Test' })
        .expect(404);

      expect(response.body.error).toBe('Utilisateur non trouvé');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('devrait permettre à un admin de supprimer un utilisateur', async () => {
      const userToDelete = await User.create({
        nom: 'User to Delete',
        email: 'delete@example.com',
        passwordHash: 'hashedpassword',
        role: 'Participant'
      });

      await request(app)
        .delete(`/api/users/${userToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedUser = await User.findById(userToDelete._id);
      expect(deletedUser).toBeNull();
    });

    it('devrait retourner 403 si un non-admin essaie de supprimer', async () => {
      const response = await request(app)
        .delete(`/api/users/${admin._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.error).toBe('Seul l\'administrateur peut supprimer un utilisateur.');
    });
  });

  describe('GET /api/users/me', () => {
    it('devrait retourner le profil de l\'utilisateur connecté', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.nom).toBe('Test User');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('devrait retourner 404 si l\'utilisateur n\'existe pas', async () => {
      const fakeToken = jwt.sign({ id: new mongoose.Types.ObjectId(), role: 'Participant' }, config.JWT_SECRET);
      
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${fakeToken}`)
        .expect(404);

      expect(response.body.error).toBe('Utilisateur non trouvé');
    });
  });

  describe('PUT /api/users/me', () => {
    it('devrait mettre à jour le profil de l\'utilisateur connecté', async () => {
      const updateData = {
        nom: 'Updated Name',
        profession: 'Designer'
      };

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.nom).toBe('Updated Name');
      expect(response.body.profession).toBe('Designer');
    });

    it('devrait retourner 400 si l\'email est déjà utilisé', async () => {
      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'admin@example.com' })
        .expect(400);

      expect(response.body.error).toBe('Cet email est déjà utilisé.');
    });
  });

  describe('GET /api/users/me/events', () => {
    it('devrait retourner les événements organisés et participés', async () => {
      const category = await Category.create({
        name: 'Test Category',
        emoji: '🎤'
      });

      const organizedEvent = await Event.create({
        name: 'Organized Event',
        description: 'Description',
        startDate: new Date(),
        city: 'Douala',
        category: category._id,
        organizer: testUser._id
      });

      const participatedEvent = await Event.create({
        name: 'Participated Event',
        description: 'Description',
        startDate: new Date(),
        city: 'Yaoundé',
        category: category._id,
        organizer: admin._id,
        participants: [testUser._id]
      });

      await Inscription.create({
        event: participatedEvent._id,
        participant: testUser._id,
        qrCodeToken: 'token123'
      });

      const response = await request(app)
        .get('/api/users/me/events')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('organized');
      expect(response.body).toHaveProperty('participated');
      expect(response.body.organized).toHaveLength(1);
      expect(response.body.participated).toHaveLength(1);
    });
  });

  describe('POST /api/users/me/upgrade-organizer', () => {
    it('devrait permettre à un participant de devenir organisateur', async () => {
      const upgradeData = {
        profession: 'Event Manager',
        sexe: 'Homme',
        phone: '123456789'
      };

      const response = await request(app)
        .post('/api/users/me/upgrade-organizer')
        .set('Authorization', `Bearer ${authToken}`)
        .send(upgradeData)
        .expect(200);

      expect(response.body.message).toBe('Félicitations, vous êtes maintenant Organisateur !');
      expect(response.body.user.role).toBe('Organisateur');
      expect(response.body.user.profession).toBe('Event Manager');
    });

    it('devrait retourner 400 si l\'utilisateur n\'est pas un participant', async () => {
      const upgradeData = {
        profession: 'Event Manager',
        sexe: 'Homme',
        phone: '123456789'
      };

      const response = await request(app)
        .post('/api/users/me/upgrade-organizer')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(upgradeData)
        .expect(403);

      expect(response.body.error).toBe('Accès interdit. Droits insuffisants.');
    });

    it('devrait retourner 400 si des champs sont manquants', async () => {
      const response = await request(app)
        .post('/api/users/me/upgrade-organizer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ profession: 'Event Manager' })
        .expect(400);

      expect(response.body.error).toBe('La profession, le sexe et le numéro de téléphone sont requis.');
    });
  });

  describe('POST /api/users/me/change-password', () => {
    it('devrait changer le mot de passe de l\'utilisateur', async () => {
      const passwordData = {
        oldPassword: 'password123',
        newPassword: 'newpassword456'
      };

      const response = await request(app)
        .post('/api/users/me/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.message).toBe('Mot de passe mis à jour avec succès.');

      const updatedUser = await User.findById(testUser._id);
      const isValid = await bcrypt.compare('newpassword456', updatedUser.passwordHash);
      expect(isValid).toBe(true);
    });

    it('devrait retourner 401 si l\'ancien mot de passe est incorrect', async () => {
      const passwordData = {
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword456'
      };

      const response = await request(app)
        .post('/api/users/me/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(401);

      expect(response.body.error).toBe('L\'ancien mot de passe est incorrect.');
    });

    it('devrait retourner 400 si le nouveau mot de passe est trop court', async () => {
      const passwordData = {
        oldPassword: 'password123',
        newPassword: '123'
      };

      const response = await request(app)
        .post('/api/users/me/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.error).toBe('Le nouveau mot de passe doit faire au moins 6 caractères.');
    });
  });

  describe('DELETE /api/users/me', () => {
    it('devrait supprimer le compte de l\'utilisateur connecté', async () => {
      await request(app)
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      const deletedUser = await User.findById(testUser._id);
      expect(deletedUser).toBeNull();
    });

    it('devrait nettoyer les inscriptions de l\'utilisateur', async () => {
      const category = await Category.create({
        name: 'Test Category',
        emoji: '🎤'
      });

      const event = await Event.create({
        name: 'Test Event',
        description: 'Description',
        startDate: new Date(),
        city: 'Douala',
        category: category._id,
        organizer: admin._id,
        participants: [testUser._id]
      });

      await Inscription.create({
        event: event._id,
        participant: testUser._id,
        qrCodeToken: 'token123'
      });

      await request(app)
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      const inscriptions = await Inscription.find({ participant: testUser._id });
      expect(inscriptions).toHaveLength(0);
    });
  });
});
