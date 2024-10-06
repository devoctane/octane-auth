import express from "express";
import OctaneAuth from "octane-auth";

const app = express();
const port = 3000;
app.use(express.json());


const auth = new OctaneAuth({
    jwtSecret: "your-secret-key",
    refreshSecret: "your-refresh-secret-key",
});




const users = new Map();




app.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password required." });
    }

    try {
        const hashedPassword = await auth.hashPassword(password);
        users.set(username, { password: hashedPassword });
        res.json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});




app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = users.get(username);

    if (!user) {
        return res.status(400).json({ error: "Invalid credentials." });
    }

    const isPasswordValid = await auth.verifyPassword(user.password, password);
    if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid credentials." });
    }

    const tokens = auth.generateTokens({ userId: username });
    res.json(tokens);
});




// Protected route
app.get("/protected", auth.authenticate(), (req, res) => {
    res.json({ message: `Hello, ${req.user.userId}!` });
});



// Refresh token route
app.post("/refresh-token", (req, res) => {
    const { refreshToken } = req.body;

    try {
        const newTokens = auth.refreshAccessToken(refreshToken);
        res.json(newTokens);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});




// Logout route (invalidate refresh token)
app.post("/logout", (req, res) => {
    const { refreshToken } = req.body;

    auth.invalidateRefreshToken(refreshToken);
    res.json({ message: "Logged out successfully." });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});