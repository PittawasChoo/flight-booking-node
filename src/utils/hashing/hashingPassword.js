import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// Hash a password
export const hashPassword = async (password) => {
    try {
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        return hash;
    } catch (err) {
        console.error("Error hashing password:", err);
        throw new Error("Error hashing password");
    }
};
