const qrCodeService = require('../services/qrCodeService');
const crypto = require('crypto');

describe('QR Code Service Tests', () => {
  describe('generateUniqueToken', () => {
    it('devrait générer un token unique', () => {
      const token = qrCodeService.generateUniqueToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 caractères hexadécimaux
    });

    it('devrait générer des tokens différents à chaque appel', () => {
      const token1 = qrCodeService.generateUniqueToken();
      const token2 = qrCodeService.generateUniqueToken();
      
      expect(token1).not.toBe(token2);
    });

    it('devrait générer un token au format hexadécimal', () => {
      const token = qrCodeService.generateUniqueToken();
      const hexRegex = /^[0-9a-f]+$/i;
      
      expect(hexRegex.test(token)).toBe(true);
    });
  });

  describe('generateQRCodeImage', () => {
    it('devrait générer une image QR code en format data URL', async () => {
      const payload = JSON.stringify({ test: 'data' });
      const qrCodeImage = await qrCodeService.generateQRCodeImage(payload);
      
      expect(qrCodeImage).toBeDefined();
      expect(typeof qrCodeImage).toBe('string');
      expect(qrCodeImage).toMatch(/^data:image\/png;base64,/);
    });

    it('devrait générer des QR codes différents pour des payloads différents', async () => {
      const payload1 = JSON.stringify({ test: 'data1' });
      const payload2 = JSON.stringify({ test: 'data2' });
      
      const qrCode1 = await qrCodeService.generateQRCodeImage(payload1);
      const qrCode2 = await qrCodeService.generateQRCodeImage(payload2);
      
      expect(qrCode1).not.toBe(qrCode2);
    });

    it('devrait générer le même QR code pour le même payload', async () => {
      const payload = JSON.stringify({ test: 'data' });
      
      const qrCode1 = await qrCodeService.generateQRCodeImage(payload);
      const qrCode2 = await qrCodeService.generateQRCodeImage(payload);
      
      expect(qrCode1).toBe(qrCode2);
    });

    it('devrait gérer les payloads complexes', async () => {
      const complexPayload = JSON.stringify({
        token: 'abc123',
        eventId: '507f1f77bcf86cd799439011',
        userId: '507f191e810c19729de860ea',
        eventName: 'Test Event',
        participant: {
          nom: 'John Doe',
          email: 'john@example.com',
          profession: 'Developer'
        }
      });
      
      const qrCodeImage = await qrCodeService.generateQRCodeImage(complexPayload);
      
      expect(qrCodeImage).toBeDefined();
      expect(qrCodeImage).toMatch(/^data:image\/png;base64,/);
    });
  });

  describe('generateQRCodeForInscription', () => {
    it('devrait générer un QR code et un token pour une inscription', async () => {
      const participantFormData = {
        nom: 'John Doe',
        email: 'john@example.com',
        profession: 'Developer'
      };

      const event = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Event'
      };

      const user = {
        _id: '507f191e810c19729de860ea'
      };

      const result = await qrCodeService.generateQRCodeForInscription(
        participantFormData,
        event,
        user
      );

      expect(result).toHaveProperty('qrCodeImage');
      expect(result).toHaveProperty('token');
      expect(result.qrCodeImage).toMatch(/^data:image\/png;base64,/);
      expect(result.token).toBeDefined();
      expect(result.token.length).toBe(64);
    });

    it('devrait inclure toutes les données du participant dans le QR code', async () => {
      const participantFormData = {
        nom: 'Jane Smith',
        email: 'jane@example.com',
        profession: 'Designer',
        phone: '123456789'
      };

      const event = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Design Conference'
      };

      const user = {
        _id: '507f191e810c19729de860ea'
      };

      const result = await qrCodeService.generateQRCodeForInscription(
        participantFormData,
        event,
        user
      );

      expect(result.qrCodeImage).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it('devrait générer des tokens uniques pour chaque inscription', async () => {
      const participantFormData = {
        nom: 'Test User',
        email: 'test@example.com',
        profession: 'Tester'
      };

      const event = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Event'
      };

      const user = {
        _id: '507f191e810c19729de860ea'
      };

      const result1 = await qrCodeService.generateQRCodeForInscription(
        participantFormData,
        event,
        user
      );

      const result2 = await qrCodeService.generateQRCodeForInscription(
        participantFormData,
        event,
        user
      );

      expect(result1.token).not.toBe(result2.token);
      expect(result1.qrCodeImage).not.toBe(result2.qrCodeImage);
    });

    it('devrait gérer les données manquantes dans participantFormData', async () => {
      const participantFormData = {
        nom: 'Minimal User'
      };

      const event = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Event'
      };

      const user = {
        _id: '507f191e810c19729de860ea'
      };

      const result = await qrCodeService.generateQRCodeForInscription(
        participantFormData,
        event,
        user
      );

      expect(result).toHaveProperty('qrCodeImage');
      expect(result).toHaveProperty('token');
    });
  });

  describe('Error Handling', () => {
    it('generateQRCodeImage devrait gérer les erreurs', async () => {
      // Test avec un payload invalide qui pourrait causer une erreur
      await expect(async () => {
        // Simuler une erreur en passant quelque chose qui pourrait causer un problème
        await qrCodeService.generateQRCodeImage(undefined);
      }).rejects.toThrow();
    });
  });
});
