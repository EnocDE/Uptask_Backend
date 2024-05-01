import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_KEY);

interface IEmail {
	email: string;
	name: string;
	token: string;
}

export class AuthEmail {
	static async sendConfirmationEmail(user: IEmail) {
		const info = await resend.emails.send({
			from: "uptask@resend.dev",
			to: user.email,
			subject: "Uptask - Confirma tu cuenta",
			text: "Uptask - Confirma tu cuenta",
			html: `
        <div class="v-text-align" style="font-size: 14px; line-height: 160%; text-align: left; word-wrap: break-word;">
          <p style="line-height: 160%;">Hola <b>${user.name}!</b>,</p>
          <p style="line-height: 160%;"> </p>
          <p style="line-height: 160%;">Te has registrado en Uptask, para activar tu cuenta solo necesitas seguir los siguientes pasos:</p>
          <ol>
            <li style="line-height: 22.4px;">Ve al enlace proporcionado en este correo.</li>
            <li style="line-height: 22.4px;">Ingresa el siguiente código de 6 dígitos: <b>${user.token} </b></li>
            <li style="line-height: 22.4px;">Listo!, tu cuenta ahora esta activada y puedes usar Uptask.</li>
          </ol>
          <p style="line-height: 160%;">El código solo puede ser usado durante los próximos 15 minutos.</p>
        </div>
        <a href='${process.env.FRONTEND_URL}/auth/confirm-account' class="p-3 bg-fuchsia-400 rounded-md font-bold text-white hover:bg-fuchsia-500 transition-colors">Activa tu cuenta</a>
      `,
		});

		console.log("Mensaje enviado", info);
	}

	static async sendPasswordResetToken(user: IEmail) {
		const info = await resend.emails.send({
			from: "uptask@resend.dev",
			to: user.email,
			subject: "Uptask - Restablece tu contraseña",
			text: "Uptask - Restablece tu contraseña",
			html: `
        <div class="v-text-align" style="font-size: 14px; line-height: 160%; text-align: left; word-wrap: break-word;">
          <p style="line-height: 160%;">Hola <b>${user.name}!</b>,</p>
          <p style="line-height: 160%;"> </p>
          <p style="line-height: 160%;">Has solicitado restablecer tu contraseña, solo tienes que seguir los siguientes pasos:</p>
          <ol>
            <li style="line-height: 22.4px;">Ve al enlace proporcionado en este correo.</li>
            <li style="line-height: 22.4px;">Ingresa el siguiente código de 6 dígitos: <b>${user.token}</b></li>
            <li style="line-height: 22.4px;">Listo!, Ahora puedes cambiar tu contraseña.</li>
          </ol>
          <p style="line-height: 160%;">El código solo puede ser usado durante los próximos 15 minutos.</p>
        </div>
        <a href='${process.env.FRONTEND_URL}/auth/new-password' class="p-3 bg-fuchsia-400 rounded-md font-bold text-white hover:bg-fuchsia-500 transition-colors">Cambia tu contraseña</a>
      `,
		});

		console.log("Mensaje enviado", info);
	}
}
