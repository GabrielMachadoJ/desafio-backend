import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export class TasksController {
  async create(req: Request, res: Response) {
    try {
      const { userId } = req;
      const { title, priority } = req.body;

      const fieldsToCheck = [
        { field: "title", message: "The title must have a valid value" },
        { field: "priority", message: "The priority must have a valid value" },
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
      const task = await prisma.tasks.create({
        data: {
          title: title.trim(),
          priority: priority.trim(),
          user_id: parseInt(userId),
        },
      });

      return res.status(201).json(task);
    } catch (error: any) {
      return res.status(500).json({
        message: "Something went wrong when creating a task",
        error: error.message,
      });
    }
  }

  async get(req: Request, res: Response) {
    try {
      const { userId } = req;

      const user = await prisma.users.findUnique({
        where: { id: parseInt(userId) },
      });

      const { role, id } = user!;

      if (role === "user") {
        const tasks = await prisma.tasks.findMany({
          where: { user_id: id },
        });
        return res.status(200).json(tasks);
      }

      const tasks = await prisma.tasks.findMany();

      return res.status(200).json(tasks);
    } catch (error: any) {
      return res.status(500).json({
        message: "Something went wrong",
        error: error.message,
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { userId } = req;
      const taskId = req.params.id;

      if (!parseInt(taskId)) {
        return res.status(400).json({ error: "The id must be a number" });
      }

      const user = await prisma.users.findUnique({
        where: { id: parseInt(userId) },
      });

      const { role, id } = user!;

      if (role === "user") {
        const task = await prisma.tasks.findUnique({
          where: { id: parseInt(taskId), user_id: id },
        });

        return res.status(200).json(task || {});
      }

      const task = await prisma.tasks.findUnique({
        where: { id: parseInt(taskId) },
      });

      return res.status(200).json(task);
    } catch (error: any) {
      return res.status(500).json({
        message: "Something went wrong",
        error: error.message,
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { userId } = req;
      const taskId = req.params.id;
      const { title, priority, user_id } = req.body;

      if (!parseInt(taskId)) {
        return res.status(400).json({ error: "The id must be a number" });
      }

      const fieldsToCheck = [
        { field: "title", message: "The title must have a valid value" },
        { field: "priority", message: "The priority must have a valid value" },
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

      const user = await prisma.users.findUnique({
        where: { id: parseInt(userId) },
      });

      const { role, id } = user!;

      if (role === "user") {
        const existingTask = await prisma.tasks.findUnique({
          where: {
            id: parseInt(taskId),
            user_id: id,
          },
        });
        if (!existingTask) {
          return res.status(400).json({
            error: "Task does not exist or is not assigned to this user",
          });
        }

        await prisma.tasks.update({
          where: {
            id: existingTask?.id,
          },
          data: {
            title,
            priority,
          },
        });

        return res.status(200).json({ messagem: "Updated successfully!" });
      }

      await prisma.tasks.update({
        where: {
          id: parseInt(taskId),
        },
        data: {
          title,
          priority,
          user_id: user_id || user?.id,
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

  async completeTask(req: Request, res: Response) {
    try {
      const { userId } = req;
      const taskId = req.params.id;

      if (!parseInt(taskId)) {
        return res.status(400).json({ error: "The id must be a number" });
      }

      const user = await prisma.users.findUnique({
        where: { id: parseInt(userId) },
      });

      const { role, id } = user!;

      if (role === "user") {
        const existingTask = await prisma.tasks.findUnique({
          where: {
            id: parseInt(taskId),
            user_id: id,
          },
        });

        if (!existingTask) {
          return res.status(400).json({
            error: "Task does not exist or is not assigned to this user",
          });
        }

        await prisma.tasks.update({
          where: {
            id: existingTask?.id,
          },
          data: {
            completed: true,
          },
        });

        return res.status(200).json({ messagem: "Task complete!" });
      }

      await prisma.tasks.update({
        where: {
          id: parseInt(taskId),
        },
        data: {
          completed: true,
        },
      });

      return res.status(200).json({ messagem: "Task complete!" });
    } catch (error: any) {
      return res.status(500).json({
        message: "Something went wrong",
        error: error.message,
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { userId } = req;
      const taskId = req.params.id;

      if (!parseInt(taskId)) {
        return res.status(400).json({ error: "The id must be a number" });
      }

      const user = await prisma.users.findUnique({
        where: { id: parseInt(userId) },
      });

      const { role, id } = user!;

      if (role === "user") {
        const existingTask = await prisma.tasks.findUnique({
          where: {
            id: parseInt(taskId),
            user_id: id,
          },
        });

        if (!existingTask) {
          return res.status(400).json({
            error: "Task does not exist or is not assigned to this user",
          });
        }

        await prisma.tasks.delete({
          where: {
            id: existingTask?.id,
          },
        });

        return res.status(200).json({ messagem: "Task deleted!" });
      }

      const existingTask = await prisma.tasks.findUnique({
        where: {
          id: parseInt(taskId),
        },
      });

      if (!existingTask) {
        return res.status(400).json({
          error: "Task does not exist",
        });
      }

      await prisma.tasks.delete({
        where: {
          id: parseInt(taskId),
        },
      });

      return res.status(200).json({ messagem: "Task deleted!" });
    } catch (error: any) {
      return res.status(500).json({
        message: "Something went wrong",
        error: error.message,
      });
    }
  }
}
