import { request, type Request, type Response } from "express";
import Project from "../models/Project";

export class ProjectController {
	static createProject = async (req: Request, res: Response) => {
    try {
      const project = new Project(req.body);
      // Asigna un manager o creador del proyecto
      project.manager = req.user.id

			// await Project.create(req.body) -> otra forma de guardar los datos
			await project.save();
			res.send("Proyecto creado correctamente");
		} catch (error) {
			console.log(error);
		}
	};

	static getAllProjects = async (req: Request, res: Response) => {
		try {
			const projects = await Project.find({ $or: [
        {manager: {$in: req.user.id}},
        {team: {$in: req.user.id}}
      ] });
      if (projects.length === 0) {
        return res.send('No hay proyectos aún');
      }
			res.json(projects);
		} catch (error) {
			console.log(error);
		}
	};

	static getProjectById = async (req: Request, res: Response) => {
		const { id } = req.params;
		try {
			const project = await Project.findById(id).populate("tasks");
			if (!project) {
				const error = new Error("No se encontró el proyecto");
				return res.status(404).json({ error: error.message });
			}

      if (project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)) {
        const error = new Error("Acción no válida");
				return res.status(404).json({ error: error.message });
      }

			res.json(project);
		} catch (error) {
			console.log(error);
		}
	};

	static updateProject = async (req: Request, res: Response) => {
		try {

			req.project.projectName = req.body.projectName;
			req.project.clientName = req.body.clientName;
			req.project.description = req.body.description;
			await req.project.save();

			res.send("Proyecto actualizado");
		} catch (error) {
			console.log(error);
		}
	};

	static deleteProject = async (req: Request, res: Response) => {
		try {

			await req.project.deleteOne();
			res.send("Proyecto eliminado");
		} catch (error) {
			console.log(error);
		}
	};
}
