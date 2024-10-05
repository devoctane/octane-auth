# Octane Auth Documentation

![Octane Auth Logo](src/assets/images/octane-auth.png)

A robust, flexible authentication package for Node.js applications.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Features](#features)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Security Considerations](#security-considerations)

## Installation

```bash
npm install octane-auth
# or
yarn add octane-auth
```

## Quick Start

```javascript
import OctaneAuth from 'octane-auth';
import express from 'express';

const app = express();
const auth = new OctaneAuth({
    jwtSecret: 'your-secret-key',
    refreshSecret: 'your-refresh-secret-key',
});

// Protected route example
app.get('/protected', auth.authenticate(), (req, res) => {
    res.json({ message: 'Access granted', user: req.user });
});
```

## Features

- 🔐 JWT-based authentication with access and refresh tokens
- 🔑 Secure password hashing with Argon2
- 🚀 Express middleware support
- ⚡ Simple and intuitive API
- 🛡️ Built-in security best practices

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

### Methods

#### `async hashPassword(password: string): Promise<string>`

Hashes a password using Argon2.

```javascript
const hashedPassword = await auth.hashPassword('userPassword123');
```

#### `async verifyPassword(hash: string, password: string): Promise<boolean>`

Verifies a password against a hash.

```javascript
const isValid = await auth.verifyPassword(hashedPassword, 'userPassword123');
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
    console.error('Invalid token');
}
```

#### `verifyRefreshToken(token: string): object`

Verifies a refresh token and returns the decoded payload.

```javascript
try {
    const decoded = auth.verifyRefreshToken(refreshToken);
    console.log(decoded.userId);
} catch (error) {
    console.error('Invalid refresh token');
}
```

#### `refreshAccessToken(refreshToken: string): { tokens: { accessToken: string, refreshToken: string } }`

Refreshes the access token using a valid refresh token.

```javascript
try {
    const { tokens } = auth.refreshAccessToken(oldRefreshToken);
    // Use the new accessToken and refreshToken
} catch (error) {
    console.error('Failed to refresh token');
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
app.get('/protected', auth.authenticate(), (req, res) => {
    res.json({ user: req.user });
});
```

## Examples

### User Registration

```javascript
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await auth.hashPassword(password);
        // Save user to database with hashedPassword
        const { accessToken, refreshToken } = auth.generateTokens({ username });
        res.json({ accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});
```

### User Login

```javascript
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Fetch user from database
        const user = await User.findOne({ username });
        const isValid = await auth.verifyPassword(user.hashedPassword, password);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const { accessToken, refreshToken } = auth.generateTokens({ userId: user.id });
        res.json({ accessToken, refreshToken });
    } catch (error) {
        res.status(401).json({ error: 'Login failed' });
    }
});
```

### Refreshing Access Token

```javascript
app.post('/refresh-token', (req, res) => {
    const { refreshToken } = req.body;

    try {
        const { tokens } = auth.refreshAccessToken(refreshToken);
        res.json(tokens);
    } catch (error) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});
```

### Logout (Invalidating Refresh Token)

```javascript
app.post('/logout', (req, res) => {
    const { refreshToken } = req.body;

    auth.invalidateRefreshToken(refreshToken);
    res.json({ message: 'Logged out successfully' });
});
```

## Security Considerations

1. **Environment Variables**: Always use environment variables for sensitive data:

```javascript
const auth = new OctaneAuth({
    jwtSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.REFRESH_SECRET,
});
```

2. **HTTPS**: Always use HTTPS in production environments.

3. **Token Storage**: Store tokens securely:
   - Browser: Use HttpOnly cookies for refresh tokens, localStorage for access tokens
   - Mobile: Use secure storage solutions

4. **Password Requirements**: Implement strong password requirements.

5. **Refresh Token Storage**: In production, use a database instead of the in-memory Map for storing refresh tokens.

6. **Token Expiration**: Adjust token expiration times based on your security requirements.

---

For more information or to contribute, please visit the [OctaneAuth GitHub repository](https://github.com/yourusername/octane-auth).
