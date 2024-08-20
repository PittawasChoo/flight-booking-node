import jwt from "jsonwebtoken";

import { SECRET_KEY } from "#config/config";

export const generateToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
        expiresIn: "1h",
    });
};

export const verifyToken = (token) => {
    return jwt.verify(token, SECRET_KEY);
};
