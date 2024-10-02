
const OctaneAuth= require('../src/index.js')
describe('OctaneAuth', () => {
    let auth;
    const userId = 1234;
    const payload = { userId };
    const password = 'securePassword';

    beforeEach(() => {
        auth = new OctaneAuth({
            jwtSecret: 'your-secret-key',
            refreshSecret: 'your-refresh-secret-key',
            tokenExpiration: '1h',
            refreshTokenExpiration: '7d',
        });
    });

    // Test for password hashing and verification
    it('should hash and verify the password', async () => {
        const hashedPassword = await auth.hashPassword(password);
        expect(hashedPassword).toBeDefined();

        const isValid = await auth.verifyPassword(password, hashedPassword);
        expect(isValid).toBe(true);

        const isInvalid = await auth.verifyPassword('wrongPassword', hashedPassword);
        expect(isInvalid).toBe(false);
    });

    // Test for token generation
    it('should generate access and refresh tokens', () => {
        const tokens = auth.generateTokens(payload);
        expect(tokens.accessToken).toBeDefined();
        expect(tokens.refreshToken).toBeDefined();
    });

    // Test for token verification
    it('should verify access token', () => {
        const { accessToken } = auth.generateTokens(payload);
        const decoded = auth.verifyToken(accessToken);
        expect(decoded.userId).toEqual(userId);
    });

    // Test for invalid access token
    it('should throw an error for invalid token', () => {
        expect(() => {
            auth.verifyToken('invalidToken');
        }).toThrow('Invalid token');
    });

    // Test for refresh token generation and validation
    it('should refresh the access token using a valid refresh token', () => {
        const tokens = auth.generateTokens(payload);
        console.log(payload);
        
        const newTokens = auth.refreshAccessToken(tokens.refreshToken);

        expect(newTokens.accessToken).toBeDefined();
        expect(newTokens.refreshToken).toEqual(tokens.refreshToken); // Same refresh token
    });

    // Test for invalid refresh token
    it('should throw an error for invalid refresh token', () => {
        expect(() => {
            auth.refreshAccessToken('invalidRefreshToken');
        }).toThrow('Invalid refresh token');
    });

    // Test for refresh token expiration
    it('should invalidate refresh token', () => {
        const tokens = auth.generateTokens(payload);

        // Invalidate refresh token
        auth.invalidateRefreshToken(tokens.refreshToken);

        expect(() => {
            auth.refreshAccessToken(tokens.refreshToken);
        }).toThrow('Invalid refresh token');
    });
});
