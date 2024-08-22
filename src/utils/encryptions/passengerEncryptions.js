import crypto from "crypto";

import { PASSENGER_ENCRYPTION_KEY } from "#config/config";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // For AES, this is always 16 bytes
// Note: IV will always be created randomly every time the data is sent to encrypt for randomness (extra security).
// IV is not secret but is essential for maintaining the integrity and security of the encrypted data.
// So, it will be sent to database together with encrypted data.

export const encryptPassenger = (data) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, PASSENGER_ENCRYPTION_KEY, iv);

    let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
    encrypted += cipher.final("hex");

    return {
        iv: iv.toString("hex"),
        data: encrypted,
    };
};

export const decryptPassenger = (encrypted) => {
    let iv = Buffer.from(encrypted.iv, "hex");
    let encryptedText = encrypted.data;
    let decipher = crypto.createDecipheriv(ALGORITHM, PASSENGER_ENCRYPTION_KEY, iv);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
};
