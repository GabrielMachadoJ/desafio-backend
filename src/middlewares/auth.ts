import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

type TokenPayload = {
  id: string;
  iat: number;
  exp: number;
};

export function AuthMiddlewares(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const secret = process.env.SECRET || "secret";
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Token not provided" });
  }

  const [, token] = authorization.split(" ");

  try {
    const decode = verify(token, secret);
    const { id } = decode as TokenPayload;

    req.userId = id;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
