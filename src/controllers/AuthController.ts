import { Request, Response } from "express";
import { AuthEmail } from "../emails/AuthEmailResend";
import Token from "../models/Token";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import { generateJWT } from "../utils/jwt";
import { generateToken } from "../utils/token";

export class AuthController {
	static async createAccount(req: Request, res: Response) {
		try {
			const { password, email } = req.body;

			// prevenir duplicados
			const userExist = await User.findOne({ email });
			if (userExist) {
				const error = new Error("El usuario ya esta registrado");
				return res.status(409).json({ error: error.message });
			}

			// Crea un usuario
			const user = new User(req.body);

			// Hashear contraseña
			user.password = await hashPassword(password);

			// Generar el token
			const token = new Token();
			token.user = user.id;
			token.token = generateToken();

			// Enviar el email
			AuthEmail.sendConfirmationEmail({
				email: user.email,
				name: user.name,
				token: token.token,
			});

			await Promise.allSettled([user.save(), token.save()]);
			res.send("Tu cuenta ha sido creada, revisa la bandeja de entrada o spam para confirmarla");
		} catch (error) {
			res.status(500).json({ error: "Hubo un error" });
		}
	}

	static async confirmAccount(req: Request, res: Response) {
		try {
			const { token } = req.body;
			const tokenExist = await Token.findOne({ token });
			if (!tokenExist) {
				const error = new Error("Token no válido");
				return res.status(404).json({ error: error.message });
			}

			const user = await User.findById(tokenExist.user);
			user.confirmed = true;

			await Promise.allSettled([
				user.save(),
				Token.deleteOne({ _id: tokenExist.id }),
			]);

			return res.send("Cuenta activada exitosamente");
		} catch (error) {
			return res.status(500).json({ error: "Hubo un error" });
		}
	}

	static async login(req: Request, res: Response) {
		try {
			const { email, password } = req.body;
			const user = await User.findOne({ email: email });

			if (!user) {
				const error = new Error("Usuario no encontrado");
				return res.status(404).json({ error: error.message });
			}

			if (!user.confirmed) {
				const tokenExist = await Token.findOne({ user: user.id });
				if (!tokenExist) {
					//Generar token
					const token = new Token();
					token.user = user.id;
					token.token = generateToken();
					await token.save();

					// Enviar email
					AuthEmail.sendConfirmationEmail({
						email: user.email,
						name: user.name,
						token: token.token,
					});
				}

				const error = new Error(
					"La cuenta no ha sido confirmada, por favor revisa tu correo para activar tu cuenta"
				);
				return res.status(401).json({ error: error.message });
			}

			// Revisar password
			const isPasswordCorrect = await checkPassword(password, user.password);
			if (!isPasswordCorrect) {
				const error = new Error("Contraseña incorrecta");
				return res.status(401).json({ error: error.message });
			}

			const token = generateJWT({ id: user._id });

			return res.send(token);
		} catch (error) {
			return res.status(500).json({ error: "Hubo un error" });
		}
	}

	static async requestConfirmationCode(req: Request, res: Response) {
		try {
			const { email } = req.body;

			// Buscar que el usuario exista
			const user = await User.findOne({ email });
			if (!user) {
				const error = new Error("El usuario no esta registrado");
				return res.status(404).json({ error: error.message });
			}

			if (user.confirmed) {
				const error = new Error("Esta cuenta ya ha sido activada");
				return res.status(403).json({ error: error.message });
			}

			const tokenExists = await Token.findOne({ user: user.id });
			if (tokenExists) {
				const error = new Error(
					"Ya se ha enviado un token, por favor revisa tu correo"
				);
				return res.status(409).json({ error: error.message });
			}

			// Generar el token
			const token = new Token();
			token.user = user.id;
			token.token = generateToken();

			// Enviar el email
			AuthEmail.sendConfirmationEmail({
				email: user.email,
				name: user.name,
				token: token.token,
			});

			await Promise.allSettled([user.save(), token.save()]);
			res.send("Se envió un nuevo token, por favor revisa tu correo");
		} catch (error) {
			res.status(500).json({ error: "Hubo un error" });
		}
	}

	static async forgotPassword(req: Request, res: Response) {
		try {
			const { email } = req.body;

			// Buscar que el usuario exista
			const user = await User.findOne({ email });
			if (!user) {
				const error = new Error("El usuario no esta registrado");
				return res.status(404).json({ error: error.message });
			}

			const tokenExists = await Token.findOne({ user: user.id });
			if (tokenExists) {
				const error = new Error(
					"Ya se han enviado las instrucciones, por favor revisa tu correo"
				);
				return res.status(409).json({ error: error.message });
			}

			// Generar el token
			const token = new Token();
			token.user = user.id;
			token.token = generateToken();
			await token.save();

			// Enviar el email
			AuthEmail.sendPasswordResetToken({
				email: user.email,
				name: user.name,
				token: token.token,
			});

			res.send("Se han enviado las instrucciones, por favor revisa tu correo");
		} catch (error) {
			res.status(500).json({ error: "Hubo un error" });
		}
	}

	static async validateToken(req: Request, res: Response) {
		try {
			const { token } = req.body;
			const tokenExist = await Token.findOne({ token });
			if (!tokenExist) {
				const error = new Error("Token no válido");
				return res.status(404).json({ error: error.message });
			}

			return res.send("Token válido, por favor ingresa tu nueva contraseña");
		} catch (error) {
			return res.status(500).json({ error: "Hubo un error" });
		}
	}

	static async updatePasswordWithToken(req: Request, res: Response) {
		const { token } = req.params;
		const { password } = req.body;

		const tokenExist = await Token.findOne({ token });
		if (!tokenExist) {
			const error = new Error("Token no válido");
			return res.status(404).json({ error: error.message });
		}

		const user = await User.findById(tokenExist.user);
		user.password = await hashPassword(password);

		try {
			await Promise.allSettled([
				tokenExist.deleteOne({ _id: tokenExist.id }),
				user.save(),
			]);
			return res.send("Tu contraseña ha sido actualizada");
		} catch (error) {
			return res.status(500).json({ error: "Hubo un error" });
		}
	}

	static async user(req: Request, res: Response) {
		return res.json(req.user);
	}

	static async updateProfile(req: Request, res: Response) {
		const { name, email } = req.body;

		try {
			const emailExists = (await User.findOne({ email: email })) ? true : false;

			if (
				req.user.email === email ||
				(req.user.email !== email && !emailExists)
			) {
				req.user.name = name;
				req.user.email = email;
			} else {
				const error = new Error("Ese correo ya esta registrado");
				return res.status(409).json({ error: error.message });
			}

			await req.user.save();
			return res.send("Perfil actualizado correctamente");
		} catch (error) {
			return res.status(500).json({ error: "Hubo un error" });
		}
	}

	static async updateCurrentUserPassword(req: Request, res: Response) {
		const { current_password, password } = req.body;
		try {
			const user = await User.findById(req.user.id);
			const isPasswordCorrect = await checkPassword(
				current_password,
				user.password
			);

			if (!isPasswordCorrect) {
				const error = new Error("La contraseña actual no es correcta");
				return res.status(401).json({ error: error.message });
			}
			user.password = await hashPassword(password);
			await user.save();
			res.send("Se ha actualizado la contraseña");
		} catch (error) {
			return res.status(500).json({ error: "Hubo un error" });
		}
	}

	static async checkPassword(req: Request, res: Response) {
		const { password } = req.body;
		try {
			const user = await User.findById(req.user.id);

			const isPasswordCorrect = await checkPassword(password, user.password);
			if (!isPasswordCorrect) {
				const error = new Error("La contraseña no es correcta");
				return res.status(401).json({ error: error.message });
			}
			
      res.send('Contraseña correcta')
		} catch (error) {
			return res.status(500).json({ error: "Hubo un error" });
		}
	}
}
