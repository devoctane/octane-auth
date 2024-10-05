import OctaneAuth from "./index.js";

const auth = new OctaneAuth();

const password = "2034WJEFJA@#4423482f";

const checkPassword = async () => {
    const hasPass = await auth.hashPassword(password);
    auth.verifyPassword(hasPass, password);
};

checkPassword();
