import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";

export class UsersController {
  async create(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;

      const fieldsToCheck = [
        { field: "name", message: "The name must have a valid value" },
        { field: "email", message: "The email must have a valid value" },
        { field: "password", message: "The password must have a valid value" },
        { field: "role", message: "The role must have a valid value" },
      ];

      for (const fieldInfo of fieldsToCheck) {
        const { field, message } = fieldInfo;
        const value = req.body[field];

        if (!value || !value.trim()) {
          return res.status(400).json({
            error: message,
          });
        }
      }

      const isUserAlreadyCreated = await prisma.users.findUnique({
        where: { email },
      });

      if (isUserAlreadyCreated) {
        return res.status(409).json({ error: "The user already exists" });
      }

      const formattedRole = role.toLowerCase().trim();

      if (formattedRole !== "admin" && formattedRole !== "user") {
        return res
          .status(400)
          .json({ error: "The allowed roles are 'admin' or 'user'" });
      }

      const hashPassword = await hash(password, 8);

      const user = await prisma.users.create({
        data: {
          name: name.trim(),
          email: email.trim(),
          password: hashPassword,
          role: formattedRole,
        },
      });

      return res.status(201).json(user);
    } catch (error: any) {
      return res.status(500).json({
        message: "Something went wrong when creating a user",
        error: error.message,
      });
    }
  }

  async get(req: Request, res: Response) {
    try {
      const { name } = req.query;
      const { role } = req.query;

      const where: any = {};

      if (name) {
        where["name"] = {
          startsWith: name as string,
        };
      }

      if (role) {
        where["role"] = {
          equals: role as string,
        };
      }

      const result = await prisma.users.findMany({
        where,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        message: "Something went wrong",
        error: error.message,
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const userId = req.params.id;

      if (!parseInt(userId)) {
        return res.status(400).json({
          error: "The id must be a number",
        });
      }

      const user = await prisma.users.findUnique({
        where: { id: parseInt(userId) },
      });

      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(500).json({
        message: "Something went wrong",
        error: error.message,
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const { name, email, password, role } = req.body;

      if (!parseInt(userId)) {
        return res.status(400).json({
          error: "The id must be a number",
        });
      }

      const fieldsToCheck = [
        { field: "name", message: "The name must have a valid value" },
        { field: "email", message: "The email must have a valid value" },
        { field: "password", message: "The password must have a valid value" },
        { field: "role", message: "The role must have a valid value" },
      ];

      for (const fieldInfo of fieldsToCheck) {
        const { field, message } = fieldInfo;
        const value = req.body[field];

        if (!value || !value.trim()) {
          return res.status(400).json({
            error: message,
          });
        }
      }

      const formattedRole = role.toLowerCase().trim();
      const hashPassword = await hash(password, 8);

      await prisma.users.update({
        where: {
          id: parseInt(userId),
        },
        data: {
          name,
          email,
          password: hashPassword,
          role: formattedRole,
        },
      });

      return res.status(200).json({ messagem: "Updated successfully!" });
    } catch (error: any) {
      return res.status(500).json({
        message: "Something went wrong",
        error: error.message,
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = req.params.id;

      if (!parseInt(userId)) {
        return res.status(400).json({
          error: "The id must be a number",
        });
      }

      await prisma.users.delete({
        where: { id: parseInt(userId) },
      });

      return res.status(200).json({ message: "Successfully deleted!" });
    } catch (error: any) {
      return res.status(500).json({
        message: "Something went wrong",
        error: error.message,
      });
    }
  }
}
