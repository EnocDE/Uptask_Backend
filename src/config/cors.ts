import { CorsOptions } from 'cors'

export const corsConfig : CorsOptions = {
  origin: function(origin, callback) {
    const fill = new Array(origin?.length).fill('-').join('')
    const whiteList = [
      process.env.FRONTEND_URL
    ]
    
    console.log(fill);
    console.log(origin);
    console.log(whiteList.includes(origin));
    console.log(fill)
    

    // // Comprobamos si estamos ejecutando el script con el parametro --api, si existe se añade a la witelist para poder usar postman
    // if (process.argv.includes('--api')) {
    //   whiteList.push(undefined)
    // }

    if (whiteList.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Error de CORS'))
    }
  }
}