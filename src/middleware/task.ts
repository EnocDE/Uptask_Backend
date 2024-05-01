import type { NextFunction, Request, Response } from "express";
import Task, { ITask } from "../models/Task";

declare global {
  namespace Express {
    interface Request {
      task: ITask
    }
  }
}

export async function taskExists(req: Request, res: Response, next: NextFunction) {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId)
    if (!task) {
      const error = new Error("No se encontró la tarea");
      return res.status(400).json({error: error.message})
    }
    req.task = task
    
    next()
  } catch (error) {
    res.status(500).json({error: 'Hubo un error'})
  }
} 

export async function tasksBelongToProject(req: Request, res: Response, next: NextFunction) {
  // El id de lainstancia y el id que captura de los params tienen diferente tipo, por lo tanto debemos convertirlo al mismo tipo para comparar
  // console.log(req.task);
  
  if (req.task.project.toString() !== req.project.id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(400).json({ error: error.message });
  }
  next()
}

export async function hasAuthorization(req: Request, res: Response, next: NextFunction) {
  
  if (req.user.id.toString() !== req.project.manager.toString()) {
    const error = new Error("Acción no válida");
    return res.status(400).json({ error: error.message });
  }
  next()
}