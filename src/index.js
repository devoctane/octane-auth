import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
class OctaneAuth {
    constructor(options = {}) {
        this.options = {
            jwtSecret: options.jwtSecret || "your-secret-key",
            tokenExpiration: options.tokenExpiration || "1h",
            saltRounds: options.saltRounds || 10,
        };
    }

    async hashPassword(password) {
        if (!password || password.length === 0) throw new Error("Please provide a valid password");

        return bcrypt.hash(password, this.options.saltRounds);
    }

    async verifyPassword(password, hash) {
        return bcrypt.compare(password, hash);
    }

    generateToken(payload) {
        return jwt.sign(payload, this.options.jwtSecret, {
            expiresIn: this.options.tokenExpiration,
        });
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, this.options.jwtSecret);
        } catch (error) {
            throw new Error("Invalid token");
        }
    }

    // Express middleware
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
                return res.status(401).json({ error: "Invalid token" });
            }
        };
    }
}

module.exports = OctaneAuth;
