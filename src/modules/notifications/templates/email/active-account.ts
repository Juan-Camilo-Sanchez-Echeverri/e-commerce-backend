import { styles } from './sections/styles';

const URL = 'https://juancamilosanchez.tech/activate-account';

interface Data {
  email: string;
  token: string;
  password: boolean;
}
export const activeAccount = (data: Data) => {
  const { email, token, password } = data;
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Activar cuenta</title>
      ${styles}
    </head>
    <body>
      <header>
        <h1>Bienvenido</h1>
      </header>

      <main>
        <p>Hola,</p>
        <p>Gracias por unirte a nosotros. Para activar tu cuenta, por favor haz clic en el siguiente enlace:</p>
        <p>
          <a class="activate-button" href="${URL}?email=${email}&token=${token}&password=${password}">
            Activar cuenta
          </a>
        </p>
        <p>Si no has solicitado activar tu cuenta, puedes ignorar este mensaje.</p>
      </main>

      <footer>
        <p>&copy; ${new Date().getFullYear()} Tu Empresa</p>
      </footer>
    </body>
    </html>
  `;
};
