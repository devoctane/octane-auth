import OctaneAuth from "./index.js";
import jwt from "jsonwebtoken";

const auth = new OctaneAuth();

const password = "2034WJEFJA@#4423482f";

const checkPassword = async () => {
    const hasPass = await auth.hashPassword(password);
    auth.verifyPassword(hasPass, password);
};

checkPassword();

const payload = {
    userId: "12345",
    email: "test@example.com",
};

const testGenerateTokens = () => {
    const tokens = auth.generateTokens(payload);

    // console.log("Access Token:", tokens.accessToken);
    // console.log("Refresh Token:", tokens.refreshToken);

    const decoded = jwt.decode(tokens.accessToken);
    // console.log("Decoded Access Token Payload:", decoded);

    try {
        const decodedToken = auth.verifyToken(tokens.accessToken);
        // console.log("Decoded Token Payload:", decodedToken);
    } catch (error) {
        console.error("Token verification failed:", error.message);
    }

    try {
        const res = auth.verifyRefreshToken(tokens.refreshToken);
        const newToken=auth.refreshAccessToken(tokens.refreshToken);
        // console.log('new access token',newToken);
        const data=auth.invalidateRefreshToken(tokens.refreshToken)
     //*******************************************do we need to return that refresh token is deleted?*****************************************

    } catch (error) {
        console.log(error);
    }
};

testGenerateTokens();
