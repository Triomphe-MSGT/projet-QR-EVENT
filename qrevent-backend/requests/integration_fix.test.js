const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
const Event = require('../models/event');
const Category = require('../models/category');
const Inscription = require('../models/inscription');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');

describe('Integration Fix Tests', () => {
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
    await Category.deleteMany({});
    await Inscription.deleteMany({});
  });

  describe('POST /api/auth/register (Multipart)', () => {
    it('should register a user with multipart/form-data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .field('nom', 'Multipart User')
        .field('email', 'multipart@example.com')
        .field('password', 'password123')
        .field('role', 'Participant')
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('multipart@example.com');
    });
  });

  describe('DELETE /api/events/:id/register', () => {
    let token;
    let eventId;
    let userId;

    beforeEach(async () => {
        // Create user
        const user = await User.create({
            nom: 'Test User',
            email: 'test@example.com',
            passwordHash: 'hash',
            role: 'Participant'
        });
        userId = user._id;
        token = jwt.sign({ id: user._id, role: user.role }, config.JWT_SECRET);

        // Create category
        const category = await Category.create({ name: 'Test Cat', emoji: '🧪' });

        // Create event
        const event = await Event.create({
            name: 'Test Event',
            description: 'Test Description',
            city: 'Test City',
            category: category._id,
            startDate: new Date(),
            organizer: user._id
        });
        eventId = event._id;

        // Register user to event
        event.participants.push(userId);
        await event.save();
        user.participatedEvents.push(eventId);
        await user.save();
        await Inscription.create({ 
            event: eventId, 
            participant: userId,
            qrCodeToken: 'test-token',
            qrCodeImage: 'data:image/png;base64,test'
        });
    });

    it('should unregister user from event', async () => {
        await request(app)
            .delete(`/api/events/${eventId}/register`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204);

        // Verify DB
        const updatedEvent = await Event.findById(eventId);
        // Check if userId is NOT in participants array
        // Note: participants contains ObjectIds, so we might need to check string conversion or use specific matcher
        const participantIds = updatedEvent.participants.map(p => p.toString());
        expect(participantIds).not.toContain(userId.toString());

        const updatedUser = await User.findById(userId);
        const eventIds = updatedUser.participatedEvents.map(e => e.toString());
        expect(eventIds).not.toContain(eventId.toString());

        const inscription = await Inscription.findOne({ event: eventId, participant: userId });
        expect(inscription).toBeNull();
    });
  });
});
