import { CorsOptions } from 'cors'

export const corsConfig : CorsOptions = {
  origin: function(origin: string, callback) {
    const whitelist = [
      process.env.FRONTEND_URL
    ]

    console.log(whitelist[0])
    console.log(origin)
    console.log(whitelist.includes(origin))
    
    if (whitelist.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Error de CORS'))
    }
  }
}