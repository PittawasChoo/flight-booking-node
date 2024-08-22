import jwt from "jsonwebtoken";

import { JWT_ENCRYPTION_KEY } from "#config/config";

export const generateToken = (user) => {
    return jwt.sign({ id: user.id }, JWT_ENCRYPTION_KEY);
};

export const verifyToken = (token, onError, onCompleted) => {
    jwt.verify(token, JWT_ENCRYPTION_KEY, (err, user) => {
        if (err) onError();

        onCompleted(user);
    });
};
