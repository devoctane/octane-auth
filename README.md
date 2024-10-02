# Octane Auth Documentation

![Octane Auth Logo](src/assets/images/octane-auth.png)

A robust, flexible authentication package for Node.js applications.

## Table of Contents

-   [Installation](#installation)
-   [Quick Start](#quick-start)
-   [Features](#features)
-   [API Reference](#api-reference)
-   [Examples](#examples)
-   [Security Best Practices](#security-best-practices)
-   [Middleware](#middleware)
-   [TypeScript Support](#typescript-support)
-   [Contributing](#contributing)

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
});

// Protected route example
app.get("/protected", auth.authenticate(), (req, res) => {
    res.json({ message: "Access granted", user: req.user });
});
```

## Features

-   🔐 JWT-based authentication
-   🔑 Secure password hashing with bcrypt
-   🚀 Express middleware support
-   ⚡ Simple and intuitive API
-   🛡️ Built-in security best practices
-   📚 Comprehensive documentation and examples

## API Reference

### `new OctaneAuth(options)`

Creates a new instance of OctaneAuth.

#### Options

| Option          | Type   | Default           | Description                      |
| --------------- | ------ | ----------------- | -------------------------------- |
| jwtSecret       | string | 'your-secret-key' | Secret key for JWT signing       |
| tokenExpiration | string | '1h'              | JWT token expiration time        |
| saltRounds      | number | 10                | Number of salt rounds for bcrypt |

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

#### `generateToken(payload: object): string`

Generates a JWT token.

```javascript
const token = auth.generateToken({ userId: 123 });
```

#### `verifyToken(token: string): object`

Verifies a JWT token and returns the decoded payload.

```javascript
try {
    const decoded = auth.verifyToken(token);
    console.log(decoded.userId);
} catch (error) {
    console.error("Invalid token");
}
```

#### `authenticate()`

Express middleware for protecting routes.

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
        const token = auth.generateToken({ username });
        res.json({ token });
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

        const token = auth.generateToken({ userId: user.id });
        res.json({ token });
    } catch (error) {
        res.status(401).json({ error: "Login failed" });
    }
});
```

## Security Best Practices

1. **Environment Variables**: Always use environment variables for sensitive data:

```javascript
const auth = new OctaneAuth({
    jwtSecret: process.env.JWT_SECRET,
});
```

2. **HTTPS**: Always use HTTPS in production environments.

3. **Token Storage**: Store tokens securely:

    - Browser: Use HttpOnly cookies
    - Mobile: Use secure storage solutions

4. **Password Requirements**: Implement strong password requirements:

```javascript
function isStrongPassword(password) {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
}
```

## Middleware

### Rate Limiting

```javascript
const rateLimit = auth.rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", rateLimit);
```

### CORS Configuration

```javascript
const cors = require("cors");

app.use(
    cors({
        origin: "https://yourdomain.com",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
```

## TypeScript Support

Octane Auth includes TypeScript definitions out of the box:

```typescript
import OctaneAuth from "octane-auth";

interface User {
    id: number;
    username: string;
}

const auth = new OctaneAuth<User>({
    jwtSecret: process.env.JWT_SECRET,
});
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Setting Up Development Environment

1. Clone the repository:

```bash
git clone https://github.com/devoctane/octane-auth.git
cd auth
```

2. Install dependencies:

```bash
npm install
```

3. Run tests:

```bash
npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

For more information, visit our [official website](https://devoctane.in/packages/octane-auth) .
