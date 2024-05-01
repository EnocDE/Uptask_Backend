import { transporter } from "../config/nodemailer";

interface IEmail {
  email: string
  name: string
  token: string
}

// Correos de prueba a tempmail
export class AuthEmailTM {
  static async sendConfirmationEmail(user : IEmail) {
    const info = await transporter.sendMail({
      from: 'Uptask <admin@uptask.com>',
      to: user.email, 
      subject: 'Uptask - Confirma tu cuenta',
      text: 'Uptask - Confirma tu cuenta',
      html: `
        <p>Hola: ${user.name}, has creado tu cuenta en Uptask, por favor confirma tu cuenta </p>
        <p>Visita el siguiente enlace:</p>
        <a href='${process.env.FRONTEND_URL}/auth/confirm-account'>Confirmar tu cuenta</a>
        <p>E ingresa el codigo <b>${user.token}</b></p>
        <p>Este token expira en 10 minutos </p>
      `
    })

    console.log('Mensaje enviado', info.messageId);
    
  }

  static async sendPasswordResetToken(user : IEmail) {
    const info = await transporter.sendMail({
      from: 'Uptask <admin@uptask.com>',
      to: user.email, 
      subject: 'Uptask - Restablece tu contraseña',
      text: 'Uptask - Restablece tu contraseña',
      html: `
        <p>Hola: ${user.name}, has solicitado restablecer tu contraseña </p>
        <p>Visita el siguiente enlace para hacerlo:</p>
        <a href='${process.env.FRONTEND_URL}/auth/new-password'>Restablecer contraseña</a>
        <p>e ingresa el código. <b>${user.token}</b></p>
        <p>Este token expira en 15 minutos </p>
      `
    })

    console.log('Mensaje enviado', info.messageId);
    
  }
}