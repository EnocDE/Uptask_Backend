import cors from 'cors'
import dotenv from "dotenv"
import express from "express"
import morgan from "morgan"
import { corsConfig } from "./config/cors"
import { connectDB } from "./config/db"
import authRoutes from "./routes/authRoutes"
import projectRoutes from "./routes/projectRoutes"

dotenv.config()
connectDB();

const app = express()

app.use(cors(corsConfig))

app.use(morgan("dev"))

app.use(express.json())

// Routes
app.use('/api/auth', authRoutes) // Aqui se agregan las rutas de la carpeta Routes
app.use('/api/projects', projectRoutes)

export default app