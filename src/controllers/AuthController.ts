import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

export class AuthController {
  async authenticate(req: Request, res: Response) {
    const secret = process.env.SECRET || "secret";

    const { email, password } = req.body;

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return res.status(403).json({ error: "User not found" });
    }

    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) {
      return res.status(403).json({ error: "Invalid password" });
    }

    const token = sign({ id: user.id }, secret, { expiresIn: "1d" });

    const { id } = user;

    return res.status(200).json({ user: { id, email }, token });
  }
}
