import * as argon2 from "argon2";
import jwt from "jsonwebtoken";

export default class OctaneAuth {
    constructor(options = {}) {
        this.options = {
            jwtSecret: options.jwtSecret || "your-secret-key",
            refreshSecret: options.refreshSecret || "your-refresh-secret-key",
            tokenExpiration: options.tokenExpiration || "1h", // Access token expiration
            refreshTokenExpiration: options.refreshTokenExpiration || "7d", // Refresh token expiration
        };
        // In-memory storage for refresh tokens
        // In production, use a database instead
        this.refreshTokens = new Map();
    }

    async hashPassword(password) {
        if (!password || password.length === 0) throw new Error("Please provide a valid password!");
        const hashedPassword = await argon2.hash(password);

        return hashedPassword; // Return hashed password
    }

    async verifyPassword(hash, password) {
        return await argon2.verify(hash, password); //Return password verify status (true, false)
    }

    // Generates both access and refresh tokens
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, this.options.jwtSecret, {
            expiresIn: this.options.tokenExpiration,
        });

        const refreshToken = jwt.sign(payload, this.options.refreshSecret, {
            expiresIn: this.options.refreshTokenExpiration,
        });

        // Store the refresh token (use a database in production)
        this.refreshTokens.set(refreshToken, payload);

        return { accessToken, refreshToken };
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, this.options.jwtSecret);
        } catch (error) {
            throw new Error("Invalid token!");
        }
    }

    verifyRefreshToken(token) {
        try {
            const payload = jwt.verify(token, this.options.refreshSecret);

            // Ensure the refresh token is stored (not invalidated)
            if (!this.refreshTokens.has(token)) {
                throw new Error("Invalid refresh token!");
            }

            return payload;
        } catch (error) {
            throw new Error("Invalid refresh token!");
        }
    }

    // Refresh the access token using a valid refresh token
    refreshAccessToken(refreshToken) {
        const payload = this.verifyRefreshToken(refreshToken);

        //Generate a new access token
        const newAccessToken = this.generateTokens({ userId: payload.userId });

        // Keep the same refresh token
        return { tokens: newAccessToken };
    }

    // Invalidate a refresh token
    invalidateRefreshToken(refreshToken) {
        this.refreshTokens.delete(refreshToken);
    }

    // Express middleware to authenticate the access token
    authenticate() {
        return (req, res, next) => {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) {
                return res.status(401).json({ error: "No token provided" });
            }
            try {
                const decoded = this.verifyToken(token);
                req.user = decoded;
                next();
            } catch (error) {
                return res.status(401).json({ error: "invalid token" });
            }
        };
    }
}
