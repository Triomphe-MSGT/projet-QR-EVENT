const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Category = require('../models/category');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');

describe('Categories Controller Tests', () => {
  let authToken;
  let adminToken;
  let testUserId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qrevent-test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Category.deleteMany({});
    await User.deleteMany({});

    // Créer un utilisateur de test
    const user = await User.create({
      nom: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
      role: 'Participant'
    });
    testUserId = user._id;
    authToken = jwt.sign({ id: user._id, role: user.role }, config.JWT_SECRET);

    // Créer un admin
    const admin = await User.create({
      nom: 'Admin User',
      email: 'admin@example.com',
      passwordHash: 'hashedpassword',
      role: 'Administrateur'
    });
    adminToken = jwt.sign({ id: admin._id, role: admin.role }, config.JWT_SECRET);
  });

  describe('GET /api/categories', () => {
    it('devrait retourner toutes les catégories', async () => {
      await Category.create([
        { name: 'Conférence', emoji: '🎤', description: 'Événements de conférence' },
        { name: 'Concert', emoji: '🎵', description: 'Événements musicaux' }
      ]);

      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('emoji');
    });

    it('devrait retourner un tableau vide si aucune catégorie n\'existe', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /api/categories/:id', () => {
    it('devrait retourner une catégorie par ID', async () => {
      const category = await Category.create({
        name: 'Conférence',
        emoji: '🎤',
        description: 'Événements de conférence'
      });

      const response = await request(app)
        .get(`/api/categories/${category._id}`)
        .expect(200);

      expect(response.body.name).toBe('Conférence');
      expect(response.body.emoji).toBe('🎤');
    });

    it('devrait retourner 404 si la catégorie n\'existe pas', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/categories/${fakeId}`)
        .expect(404);

      expect(response.body.error).toBe('Catégorie non trouvée');
    });

    it('devrait retourner 400 pour un ID invalide', async () => {
      const response = await request(app)
        .get('/api/categories/invalidid')
        .expect(400);

      expect(response.body.error).toBe('ID invalide');
    });
  });

  describe('POST /api/categories', () => {
    it('devrait créer une nouvelle catégorie', async () => {
      const categoryData = {
        name: 'Sport',
        emoji: '⚽',
        description: 'Événements sportifs'
      };

      const response = await request(app)
        .post('/api/categories')
        .send(categoryData)
        .expect(201);

      expect(response.body.name).toBe(categoryData.name);
      expect(response.body.emoji).toBe(categoryData.emoji);
      expect(response.body.description).toBe(categoryData.description);

      const savedCategory = await Category.findById(response.body._id);
      expect(savedCategory).toBeTruthy();
    });

    it('devrait retourner une erreur si la catégorie existe déjà', async () => {
      await Category.create({
        name: 'Sport',
        emoji: '⚽',
        description: 'Événements sportifs'
      });

      const response = await request(app)
        .post('/api/categories')
        .send({
          name: 'Sport',
          emoji: '⚽',
          description: 'Autre description'
        })
        .expect(400);

      expect(response.body.error).toBe('Cette catégorie existe déjà.');
    });
  });

  describe('GET /api/categories/name/:name', () => {
    it('devrait retourner une catégorie par nom', async () => {
      await Category.create({
        name: 'Conférence',
        emoji: '🎤',
        description: 'Événements de conférence'
      });

      const response = await request(app)
        .get('/api/categories/name/Conférence')
        .expect(200);

      expect(response.body.name).toBe('Conférence');
    });

    it('devrait retourner 404 si la catégorie n\'existe pas', async () => {
      const response = await request(app)
        .get('/api/categories/name/Inexistant')
        .expect(404);

      expect(response.body.error).toBe('Catégorie non trouvée');
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('devrait mettre à jour une catégorie', async () => {
      const category = await Category.create({
        name: 'Sport',
        emoji: '⚽',
        description: 'Événements sportifs'
      });

      const updateData = {
        name: 'Sport',
        emoji: '🏀',
        description: 'Événements sportifs mis à jour'
      };

      const response = await request(app)
        .put(`/api/categories/${category._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.emoji).toBe('🏀');
      expect(response.body.description).toBe('Événements sportifs mis à jour');
    });

    it('devrait retourner 404 si la catégorie n\'existe pas', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/categories/${fakeId}`)
        .send({ name: 'Test', emoji: '🎤' })
        .expect(404);

      expect(response.body.error).toBe('Catégorie non trouvée');
    });

    it('devrait retourner une erreur si le nouveau nom existe déjà', async () => {
      await Category.create({ name: 'Sport', emoji: '⚽' });
      const category2 = await Category.create({ name: 'Concert', emoji: '🎵' });

      const response = await request(app)
        .put(`/api/categories/${category2._id}`)
        .send({ name: 'Sport', emoji: '🎵' })
        .expect(400);

      expect(response.body.error).toBe('Cette catégorie existe déjà.');
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('devrait supprimer une catégorie', async () => {
      const category = await Category.create({
        name: 'Sport',
        emoji: '⚽',
        description: 'Événements sportifs'
      });

      await request(app)
        .delete(`/api/categories/${category._id}`)
        .expect(204);

      const deletedCategory = await Category.findById(category._id);
      expect(deletedCategory).toBeNull();
    });

    it('devrait retourner 404 si la catégorie n\'existe pas', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/categories/${fakeId}`)
        .expect(404);

      expect(response.body.error).toBe('Catégorie non trouvée');
    });

    it('devrait retourner 400 pour un ID invalide', async () => {
      const response = await request(app)
        .delete('/api/categories/invalidid')
        .expect(400);

      expect(response.body.error).toBe('ID invalide');
    });
  });
});
