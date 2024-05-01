import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExists } from "../middleware/project";
import {
	hasAuthorization,
	taskExists,
	tasksBelongToProject,
} from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamMemberController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

const router = Router();

// Middleware que se aplica a todas las rutas del archivo
router.use(authenticate);

router.post(
	"/",
	body("projectName")
		.notEmpty()
		.withMessage("El nombre del proyecto es obligatorio"),
	body("clientName")
		.notEmpty()
		.withMessage("El nombre del cliente es obligatorio"),
	body("description")
		.notEmpty()
		.withMessage("La descripción del proyecto es obligatoria"),
	handleInputErrors,
	ProjectController.createProject
);

router.get("/", ProjectController.getAllProjects);

router.get(
	"/:id",
	param("id").isMongoId().withMessage("El ID del proyecto no es válido"),
	handleInputErrors,
	ProjectController.getProjectById
);

// Middleware que se aplica a la url que contenga ese parametro
router.param("projectId", projectExists);

router.put(
	"/:projectId",
	param("projectId").isMongoId().withMessage("El ID del proyecto no es válido"),
	body("projectName")
		.notEmpty()
		.withMessage("El nombre del proyecto es obligatorio"),
	body("clientName")
		.notEmpty()
		.withMessage("El nombre del cliente es obligatorio"),
	body("description")
		.notEmpty()
		.withMessage("La descripción del proyecto es obligatoria"),
	handleInputErrors,
  hasAuthorization,
	ProjectController.updateProject
);

router.delete(
	"/:projectId",
	param("projectId").isMongoId().withMessage("El ID del proyecto no es válido"),
	handleInputErrors,
	ProjectController.deleteProject
);

// Routes for tasks

router.post(
	"/:projectId/tasks",
	hasAuthorization,
	param("projectId").isMongoId().withMessage("El ID del proyecto no es válido"),
	body("name").notEmpty().withMessage("El nombre de la tarea es obligatorio"),
	body("description")
		.notEmpty()
		.withMessage("La descripción de la tarea es obligatoria"),
	handleInputErrors,
	TaskController.createTask
);

router.get(
	"/:projectId/tasks",
	param("projectId").isMongoId().withMessage("El ID del proyecto no es válido"),
	TaskController.getAllTasks
);

router.param("taskId", taskExists);
router.param("taskId", tasksBelongToProject);

router.get(
	"/:projectId/tasks/:taskId",
	param("projectId").isMongoId().withMessage("El ID del proyecto no es válido"),
	param("taskId").isMongoId().withMessage("El ID de la tarea no es válido"),
	handleInputErrors,
	TaskController.getTaskById
);

router.put(
	"/:projectId/tasks/:taskId",
	hasAuthorization,
	param("projectId").isMongoId().withMessage("El ID del proyecto no es válido"),
	param("taskId").isMongoId().withMessage("El ID de la tarea no es válido"),
	body("name").notEmpty().withMessage("El nombre de la tarea es obligatorio"),
	body("description")
		.notEmpty()
		.withMessage("La descripción de la tarea es obligatoria"),
	handleInputErrors,
	TaskController.updateTask
);

router.delete(
	"/:projectId/tasks/:taskId",
	hasAuthorization,
	param("projectId").isMongoId().withMessage("El ID del proyecto no es válido"),
	param("taskId").isMongoId().withMessage("El ID de la tarea no es válido"),
	handleInputErrors,
	TaskController.deleteTask
);

router.post(
	"/:projectId/tasks/:taskId/status",
	param("projectId").isMongoId().withMessage("El ID del proyecto no es válido"),
	param("taskId").isMongoId().withMessage("El ID de la tarea no es válido"),
	body("status").notEmpty().withMessage("El estado de la tarea es obligatorio"),
	handleInputErrors,
	TaskController.updateStatus
);

// Routes for teams

router.post(
	"/:projectId/team/find",
	body("email").isEmail().toLowerCase().withMessage("Correo no válido"),
	handleInputErrors,
	TeamMemberController.findMemberByEmail
);

router.get("/:projectId/team", TeamMemberController.getProjectTeam);

router.post(
	"/:projectId/team",
	body("id").isMongoId().withMessage("ID no válido"),
	handleInputErrors,
	TeamMemberController.addMemberById
);

router.delete(
	"/:projectId/team/:userId",
	param("userId").isMongoId().withMessage("ID no válido"),
	handleInputErrors,
	TeamMemberController.removeMemberById
);

// Routes for Notes

router.get('/:projectId/tasks/:taskId/notes',
  NoteController.getTaskNotes
)

router.post('/:projectId/tasks/:taskId/notes',
  body('content').notEmpty().withMessage('El contenido de la nota es obligatorio'),
  handleInputErrors,
  NoteController.createNote
)

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
  param('noteId').isMongoId().withMessage('ID no válido'),
  handleInputErrors,
  NoteController.deleteNote
)

export default router;
