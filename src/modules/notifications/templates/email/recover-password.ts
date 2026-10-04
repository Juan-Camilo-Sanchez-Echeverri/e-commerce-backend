import { styles } from './sections/styles';

const URL = 'https://juancamilosanchez.tech/activate-account';

interface Data {
  email: string;
  token: string;
}

export const recoverPassword = (data: Data) => {
  const { email, token } = data;
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperar contraseña</title>
      ${styles}
    </head>
    <body>
      <header>
        <h1>Recuperar contraseña</h1>
      </header>

      <main>
        <p>Hola,</p>
        <p>Recibimos una solicitud para recuperar tu contraseña. Para continuar con el proceso, por favor haz clic en el siguiente enlace:</p>
        <p>
          <a class="activate-button" href="${URL}?email=${email}&token=${token}">
            Recuperar contraseña
          </a>
        </p>
        <p>Si no has solicitado recuperar tu contraseña, puedes ignorar este mensaje.</p>
      </main>

      <footer>
        <p>&copy; ${new Date().getFullYear()} Tu Empresa</p>
      </footer>
    </body>
    </html>
  `;
};
