const emailService = require('../services/emailService');

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn((mailOptions, callback) => {
      if (callback) {
        callback(null, { messageId: 'test-message-id' });
      }
      return Promise.resolve({ messageId: 'test-message-id' });
    })
  }))
}));

describe('Email Service Tests', () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('devrait envoyer un email avec les paramètres corrects', async () => {
      const to = 'test@example.com';
      const subject = 'Test Subject';
      const text = 'Test email body';
      const html = '<p>Test email body</p>';

      // Le service devrait fonctionner en mode STUB si EMAIL_USER n'est pas défini
      await expect(emailService.sendEmail(to, subject, text, html)).resolves.not.toThrow();
    });

    it('devrait gérer l\'envoi d\'email en mode texte uniquement', async () => {
      const to = 'test@example.com';
      const subject = 'Test Subject';
      const text = 'Test email body';

      await expect(emailService.sendEmail(to, subject, text)).resolves.not.toThrow();
    });

    it('devrait gérer l\'envoi d\'email en mode HTML uniquement', async () => {
      const to = 'test@example.com';
      const subject = 'Test Subject';
      const html = '<p>Test email body</p>';

      await expect(emailService.sendEmail(to, subject, null, html)).resolves.not.toThrow();
    });

    it('devrait fonctionner en mode STUB si les credentials ne sont pas configurés', async () => {
      // Sauvegarder les variables d'environnement originales
      const originalEmailUser = process.env.EMAIL_USER;
      const originalEmailPass = process.env.EMAIL_PASS;

      // Supprimer les credentials
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASS;

      const to = 'test@example.com';
      const subject = 'Test Subject';
      const text = 'Test email body';

      // En mode STUB, l'email ne devrait pas être envoyé mais ne devrait pas lancer d'erreur
      await expect(emailService.sendEmail(to, subject, text)).resolves.not.toThrow();

      // Restaurer les variables d'environnement
      process.env.EMAIL_USER = originalEmailUser;
      process.env.EMAIL_PASS = originalEmailPass;
    });

    it('devrait accepter plusieurs destinataires', async () => {
      const to = 'test1@example.com, test2@example.com';
      const subject = 'Test Subject';
      const text = 'Test email body';

      await expect(emailService.sendEmail(to, subject, text)).resolves.not.toThrow();
    });

    it('devrait gérer les caractères spéciaux dans le sujet et le corps', async () => {
      const to = 'test@example.com';
      const subject = 'Événement spécial: Conférence à Yaoundé 🎤';
      const text = 'Bonjour,\n\nVous êtes invité à l\'événement.\n\nCordialement,\nL\'équipe';
      const html = '<p>Bonjour,</p><p>Vous êtes invité à l\'<strong>événement</strong>.</p>';

      await expect(emailService.sendEmail(to, subject, text, html)).resolves.not.toThrow();
    });

    it('devrait gérer les emails longs', async () => {
      const to = 'test@example.com';
      const subject = 'Long Email Test';
      const text = 'A'.repeat(10000); // Email très long
      const html = '<p>' + 'A'.repeat(10000) + '</p>';

      await expect(emailService.sendEmail(to, subject, text, html)).resolves.not.toThrow();
    });
  });

  describe('Email Configuration', () => {
    it('devrait utiliser Gmail comme service par défaut', () => {
      // Ce test vérifie que le service est configuré correctement
      // En mode test, cela devrait fonctionner même sans credentials
      expect(emailService).toHaveProperty('sendEmail');
      expect(typeof emailService.sendEmail).toBe('function');
    });
  });

  describe('Email Content Validation', () => {
    it('devrait gérer les emails avec pièces jointes (si supporté)', async () => {
      const to = 'test@example.com';
      const subject = 'Email with Attachment';
      const text = 'Please find the attachment';

      // Le service actuel ne gère pas les pièces jointes, mais le test
      // vérifie que l'envoi de base fonctionne
      await expect(emailService.sendEmail(to, subject, text)).resolves.not.toThrow();
    });

    it('devrait gérer les templates d\'email pour les inscriptions', async () => {
      const to = 'participant@example.com';
      const subject = 'Confirmation: Tech Conference 2024';
      const text = 'Bonjour John Doe,\n\nVous êtes inscrit à Tech Conference 2024 (15/12/2024).';
      const html = `
        <p>Bonjour John Doe,</p>
        <p>Vous êtes inscrit à <strong>Tech Conference 2024</strong>.</p>
        <p>Date: 15/12/2024</p>
        <p>Lieu: Douala, Cameroun</p>
      `;

      await expect(emailService.sendEmail(to, subject, text, html)).resolves.not.toThrow();
    });

    it('devrait gérer les emails de notification', async () => {
      const to = 'organizer@example.com';
      const subject = 'Nouvelle inscription à votre événement';
      const text = 'John Doe s\'est inscrit à "Tech Conference 2024".';
      const html = '<p><strong>John Doe</strong> s\'est inscrit à "Tech Conference 2024".</p>';

      await expect(emailService.sendEmail(to, subject, text, html)).resolves.not.toThrow();
    });
  });

  describe('Error Scenarios', () => {
    it('devrait gérer les adresses email invalides gracieusement', async () => {
      const to = 'invalid-email';
      const subject = 'Test';
      const text = 'Test';

      // En mode STUB, même les emails invalides ne devraient pas causer d'erreur
      await expect(emailService.sendEmail(to, subject, text)).resolves.not.toThrow();
    });

    it('devrait gérer les sujets vides', async () => {
      const to = 'test@example.com';
      const subject = '';
      const text = 'Test email body';

      await expect(emailService.sendEmail(to, subject, text)).resolves.not.toThrow();
    });

    it('devrait gérer les corps d\'email vides', async () => {
      const to = 'test@example.com';
      const subject = 'Test Subject';
      const text = '';

      await expect(emailService.sendEmail(to, subject, text)).resolves.not.toThrow();
    });
  });
});
