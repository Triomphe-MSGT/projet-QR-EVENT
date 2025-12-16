const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/user');
const config = require('../utils/config');

describe('Auth Controller Tests', () => {
  beforeAll(async () => {
    // Connexion à la base de données de test
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qrevent-test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Nettoyer la base de données avant chaque test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('devrait créer un nouvel utilisateur avec succès', async () => {
      const userData = {
        nom: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.nom).toBe(userData.nom);
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('devrait retourner une erreur si l\'email existe déjà', async () => {
      const userData = {
        nom: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      // Créer un utilisateur
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Essayer de créer le même utilisateur
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('Email déjà utilisé.');
    });

    it('devrait retourner une erreur si des champs sont manquants', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body.message).toBe('Nom, email et mot de passe sont requis.');
    });

    it('devrait hasher le mot de passe', async () => {
      const userData = {
        nom: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const user = await User.findOne({ email: userData.email });
      expect(user.passwordHash).toBeDefined();
      expect(user.passwordHash).not.toBe(userData.password);
      
      const isValid = await bcrypt.compare(userData.password, user.passwordHash);
      expect(isValid).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Créer un utilisateur de test
      const passwordHash = await bcrypt.hash('password123', 10);
      await User.create({
        nom: 'Test User',
        email: 'test@example.com',
        passwordHash
      });
    });

    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.message).toBe('Connexion réussie');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('devrait retourner une erreur avec un email invalide', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.message).toBe('Utilisateur introuvable.');
    });

    it('devrait retourner une erreur avec un mot de passe invalide', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.message).toBe('Mot de passe incorrect.');
    });

    it('devrait retourner une erreur si des champs sont manquants', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body.message).toBe('Email et mot de passe requis.');
    });

    it('devrait générer un token JWT valide', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      const decoded = jwt.verify(response.body.token, config.JWT_SECRET);
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('role');
    });
  });

  describe('POST /api/auth/google', () => {
    it('devrait retourner une erreur si le token Google est manquant', async () => {
      const response = await request(app)
        .post('/api/auth/google')
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Token Google requis.');
    });

    // Note: Les tests complets pour Google OAuth nécessiteraient de mocker
    // la bibliothèque google-auth-library
  });
});
