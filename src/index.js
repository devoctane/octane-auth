import * as argon2 from "argon2";

export default class OctaneAuth {
    constructor(options = {}) {
        //    this.options = {
        //   jwtSecret: options.jwtSecret || "your-secret-key",
        //   refreshSecret: options.refreshSecret || "your-refresh-secret-key",
        //   tokenExpiration: options.tokenExpiration || "1h", // Access token expiration
        //   refreshTokenExpiration: options.refreshTokenExpiration || "7d", // Refresh token expiration
        //   saltRounds: options.saltRounds || 10,
        //    };
        // In-memory storage for refresh tokens
        // In production, use a database instead
        //    this.refreshTokens = new Map();
    }

    async hashPassword(password) {
        if (!password || password.length === 0) throw new Error("Please provide a valid password!");
        const hashedPassword = await argon2.hash(password);

        return hashedPassword; // Return hashed password
    }

    async verifyPassword(hash, password) {
        const verifyPassword = await argon2.verify(hash, password);
        console.log(verifyPassword);
        //    return await argon2.verify(hash, password);
    }
}
