# Octane Auth Documentation

![Octane Auth Logo](src/assets/images/octane-auth.png)

A robust, flexible authentication package for Node.js applications with support for access and refresh tokens.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Features](#features)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Security Best Practices](#security-best-practices)
- [TypeScript Support](#typescript-support)
- [Contributing](#contributing)

## Installation

```bash
npm install octane-auth
# or
yarn add octane-auth
```

## Quick Start

```javascript
const OctaneAuth = require("octane-auth");
const express = require("express");

const app = express();
const auth = new OctaneAuth({
    jwtSecret: "your-secret-key",
    refreshSecret: "your-refresh-secret-key",
});

// Protected route example
app.get("/protected", auth.authenticate(), (req, res) => {
    res.json({ message: "Access granted", user: req.user });
});
```

## Features

- 🔐 JWT-based authentication with access and refresh tokens
- 🔑 Secure password hashing with bcrypt
- 🚀 Express middleware support
- ⚡ Simple and intuitive API
- 🛡️ Built-in security best practices
- 📚 Comprehensive documentation and examples

## API Reference

### `new OctaneAuth(options)`

Creates a new instance of OctaneAuth.

#### Options

| Option                 | Type   | Default                 | Description                           |
|------------------------|--------|-------------------------|---------------------------------------|
| jwtSecret              | string | 'your-secret-key'       | Secret key for JWT signing            |
| refreshSecret          | string | 'your-refresh-secret-key'| Secret key for refresh token signing  |
| tokenExpiration        | string | '1h'                    | Access token expiration time          |
| refreshTokenExpiration | string | '7d'                    | Refresh token expiration time         |
| saltRounds             | number | 10                      | Number of salt rounds for bcrypt      |

### Methods

#### `async hashPassword(password: string): Promise<string>`

Hashes a password using bcrypt.

```javascript
const hashedPassword = await auth.hashPassword("userPassword123");
```

#### `async verifyPassword(password: string, hash: string): Promise<boolean>`

Verifies a password against a hash.

```javascript
const isValid = await auth.verifyPassword("userPassword123", hashedPassword);
```

#### `generateTokens(payload: object): { accessToken: string, refreshToken: string }`

Generates both access and refresh tokens.

```javascript
const { accessToken, refreshToken } = auth.generateTokens({ userId: 123 });
```

#### `verifyToken(token: string): object`

Verifies an access token and returns the decoded payload.

```javascript
try {
    const decoded = auth.verifyToken(accessToken);
    console.log(decoded.userId);
} catch (error) {
    console.error("Invalid token");
}
```

#### `verifyRefreshToken(token: string): object`

Verifies a refresh token and returns the decoded payload.

```javascript
try {
    const decoded = auth.verifyRefreshToken(refreshToken);
    console.log(decoded.userId);
} catch (error) {
    console.error("Invalid refresh token");
}
```

#### `refreshAccessToken(refreshToken: string): { accessToken: string, refreshToken: string }`

Refreshes the access token using a valid refresh token.

```javascript
try {
    const { accessToken, refreshToken } = auth.refreshAccessToken(oldRefreshToken);
    // Use the new accessToken and refreshToken
} catch (error) {
    console.error("Failed to refresh token");
}
```

#### `invalidateRefreshToken(refreshToken: string): void`

Invalidates a refresh token.

```javascript
auth.invalidateRefreshToken(refreshToken);
```

#### `authenticate()`

Express middleware for protecting routes using the access token.

```javascript
app.get("/protected", auth.authenticate(), (req, res) => {
    res.json({ user: req.user });
});
```

## Examples

### User Registration

```javascript
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await auth.hashPassword(password);
        // Save user to database with hashedPassword
        const { accessToken, refreshToken } = auth.generateTokens({ username });
        res.json({ accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
});
```

### User Login

```javascript
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Fetch user from database
        const user = await User.findOne({ username });
        const isValid = await auth.verifyPassword(password, user.hashedPassword);

        if (!isValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const { accessToken, refreshToken } = auth.generateTokens({ userId: user.id });
        res.json({ accessToken, refreshToken });
    } catch (error) {
        res.status(401).json({ error: "Login failed" });
    }
});
```

### Refreshing Access Token

```javascript
app.post("/refresh-token", (req, res) => {
    const { refreshToken } = req.body;

    try {
        const { accessToken, refreshToken: newRefreshToken } = auth.refreshAccessToken(refreshToken);
        res.json({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
        res.status(401).json({ error: "Invalid refresh token" });
    }
});
```

### Logout (Invalidating Refresh Token)

```javascript
app.post("/logout", (req, res) => {
    const { refreshToken } = req.body;

    auth.invalidateRefreshToken(refreshToken);
    res.json({ message: "Logged out successfully" });
});
```

## Security Best Practices

1. **Environment Variables**: Always use environment variables for sensitive data:

```javascript
const auth = new OctaneAuth({
    jwtSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.REFRESH_SECRET,
});
```

2. **HTTPS**: Always use HTTPS in production environments.

3. **Token Storage**: Store tokens securely:
   - Browser: Use HttpOnly cookies for refresh tokens, local storage for access tokens
   - Mobile: Use secure storage solutions

4. **Password Requirements**: Implement strong password requirements.

5. **Token Rotation**: Implement refresh token rotation for enhanced security.

## TypeScript Support

OctaneAuth includes TypeScript definitions:

```typescript
import OctaneAuth from "octane-auth";

interface User {
    id: number;
    username: string;
}

const auth = new OctaneAuth<User>({
    jwtSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.REFRESH_SECRET,
});
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

For more information, visit our [official website](https://devoctane.in/packages/octane-auth).