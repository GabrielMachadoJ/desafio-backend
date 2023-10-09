import { Router } from "express";
import { UsersController } from "./controllers/UsersController";
import { AuthController } from "./controllers/AuthController";
import { TasksController } from "./controllers/TasksController";
import { AuthMiddlewares } from "./middlewares/auth";

const usersController = new UsersController();
const authController = new AuthController();
const tasksController = new TasksController();

export const router = Router();

router.post("/auth", authController.authenticate);

router.post("/users", usersController.create);
router.get("/users", usersController.get);
router.get("/users/:id", usersController.getById);
router.put("/users/:id", usersController.update);
router.delete("/users/:id", usersController.delete);

router.post("/tasks", AuthMiddlewares, tasksController.create);
router.get("/tasks", AuthMiddlewares, tasksController.get);
router.get("/tasks/:id", AuthMiddlewares, tasksController.getById);
router.put("/tasks/:id", AuthMiddlewares, tasksController.update);
router.patch(
  "/tasks/:id/complete",
  AuthMiddlewares,
  tasksController.completeTask
);
router.delete("/tasks/:id", AuthMiddlewares, tasksController.delete);
