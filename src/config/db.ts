import colors from "colors";
import mongoose from "mongoose";


export async function connectDB() {
  try {
    const {connection} = await mongoose.connect(process.env.DATABASE_URL)
    const url = `${connection.host}:${connection.port}`  
    console.log(colors.magenta(`MongoDB conectado en: ${url}`));
      
  } catch (error) {
    console.log(colors.red('Error al conectar a MongoDB'));
    process.exit(1)
  }
}