// __tests__/OctaneAuth.test.js
const OctaneAuth = require('../src/index');
const jwt = require('jsonwebtoken');

describe('OctaneAuth', () => {
  let auth;
  const testSecret = 'test-secret';
  const testOptions = {
    jwtSecret: testSecret,
    tokenExpiration: '1h',
    saltRounds: 10
  };

  beforeEach(() => {
    auth = new OctaneAuth(testOptions);
  });

  describe('Constructor', () => {
    test('should create instance with default options', () => {
      const defaultAuth = new OctaneAuth();
      expect(defaultAuth).toBeInstanceOf(OctaneAuth);
      expect(defaultAuth.options).toHaveProperty('jwtSecret');
      expect(defaultAuth.options).toHaveProperty('tokenExpiration');
      expect(defaultAuth.options).toHaveProperty('saltRounds');
    });

    test('should create instance with custom options', () => {
      expect(auth.options).toEqual(testOptions);
    });
  });

  describe('Password Hashing', () => {
    const testPassword = 'TestPassword123';
    
    test('should hash password', async () => {
      const hash = await auth.hashPassword(testPassword);
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(testPassword);
    });

    test('should verify correct password', async () => {
      const hash = await auth.hashPassword(testPassword);
      const isValid = await auth.verifyPassword(testPassword, hash);
      expect(isValid).toBe(true);
    });

    test('should not verify incorrect password', async () => {
      const hash = await auth.hashPassword(testPassword);
      const isValid = await auth.verifyPassword('WrongPassword', hash);
      expect(isValid).toBe(false);
    });

    test('should handle empty password', async () => {
      await expect(auth.hashPassword('')).rejects.toThrow();
    });
  });

  describe('Token Generation and Verification', () => {
    const testPayload = { userId: 123, role: 'user' };

    test('should generate valid JWT token', () => {
      const token = auth.generateToken(testPayload);
      expect(typeof token).toBe('string');
      const decoded = jwt.verify(token, testSecret);
      expect(decoded).toMatchObject(testPayload);
    });

    test('should verify valid token', () => {
      const token = auth.generateToken(testPayload);
      const decoded = auth.verifyToken(token);
      expect(decoded).toMatchObject(testPayload);
    });

    test('should throw on invalid token', () => {
      expect(() => auth.verifyToken('invalid-token')).toThrow();
    });

    test('should throw on expired token', () => {
      const expiredAuth = new OctaneAuth({
        ...testOptions,
        tokenExpiration: '0s'
      });
      const token = expiredAuth.generateToken(testPayload);
      
      // Wait for token to expire
      return new Promise(resolve => setTimeout(resolve, 1000)).then(() => {
        expect(() => expiredAuth.verifyToken(token)).toThrow();
      });
    });
  });

  describe('Express Middleware', () => {
    let mockReq;
    let mockRes;
    let nextFunction;

    beforeEach(() => {
      mockReq = {
        headers: {}
      };
      mockRes = {
        status: jest.fn(() => mockRes),
        json: jest.fn(() => mockRes)
      };
      nextFunction = jest.fn();
    });

    test('should call next() with valid token', () => {
      const token = auth.generateToken({ userId: 123 });
      mockReq.headers.authorization = `Bearer ${token}`;
      
      auth.authenticate()(mockReq, mockRes, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
      expect(mockReq).toHaveProperty('user');
      expect(mockReq.user).toHaveProperty('userId', 123);
    });

    test('should return 401 without token', () => {
      auth.authenticate()(mockReq, mockRes, nextFunction);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 401 with invalid token', () => {
      mockReq.headers.authorization = 'Bearer invalid-token';
      
      auth.authenticate()(mockReq, mockRes, nextFunction);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle null values gracefully', async () => {
      await expect(auth.hashPassword(null)).rejects.toThrow();
      await expect(auth.verifyPassword(null, null)).rejects.toThrow();
      expect(() => auth.generateToken(null)).toThrow();
      expect(() => auth.verifyToken(null)).toThrow();
    });

    test('should handle undefined values gracefully', async () => {
      await expect(auth.hashPassword(undefined)).rejects.toThrow();
      await expect(auth.verifyPassword(undefined, undefined)).rejects.toThrow();
      expect(() => auth.generateToken(undefined)).toThrow();
      expect(() => auth.verifyToken(undefined)).toThrow();
    });
  });
});