import type { Request, Response } from "express";
import User from "../models/User";
import Project from "../models/Project";

export class TeamMemberController {
  static async findMemberByEmail(req: Request, res: Response) {
    const { email } = req.body
    try {
      const user = await User.findOne({email}).select('_id email name')

      if (!user) {
        const error = new Error('No se encontró el usuario');
        return res.status(404).json({error: error.message})
      }

      return res.json(user)
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }    
  }

  static async getProjectTeam(req: Request, res: Response) {
    try {
      const project = await Project.findById(req.project.id).populate({
        path: 'team',
        select: 'id email name'
      })

      res.json(project.team)
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }    
  }

  static async addMemberById(req: Request, res: Response) {
    const { id } = req.body
    try {
      const user = await User.findById(id).select('id')

      if (id.toString() === req.project.manager.toString()) {
        const error = new Error('Tú ya estas en este projecto');
        return res.status(404).json({error: error.message})
      }

      if (!user) {
        const error = new Error('No se encontró el usuario');
        return res.status(404).json({error: error.message})
      }

      if (req.project.team.some( teamMember => teamMember.toString() === user.id.toString())) {
        const error = new Error('El usuario ya está en este proyecto');
        return res.status(409).json({error: error.message})
      }

      // Agregar usuario y guardar cambios
      req.project.team.push(user.id)
      await req.project.save()

      return res.send('Usuario agregado correctamente')
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }    
  }

  static async removeMemberById(req: Request, res: Response) {
    const { userId } = req.params
    console.log(req.params);
    
    try {
      
      if (!req.project.team.some(teamMember => teamMember.toString() === userId)) {
        const error = new Error('El usuario no existe en el proyecto');
        return res.status(409).json({error: error.message})
      }

      req.project.team = req.project.team.filter( teamMember => teamMember.toString() !== userId)
      await req.project.save()

      return res.send('Usuario eliminado correctamente')
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }    
  }

}