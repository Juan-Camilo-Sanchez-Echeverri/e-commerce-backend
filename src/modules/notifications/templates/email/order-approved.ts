import { styles } from './sections/styles';

const TRACKING_BASE_URL = 'https://juancamilosanchez.tech/tracking';

interface Data {
  trackingCode: string;
  items: Array<{ quantity: number; product: { name: string }; size: string }>;
  total: number;
}

export const orderApproved = (data: Data) => {
  const { trackingCode, items, total } = data;
  const trackingUrl = `${TRACKING_BASE_URL}/${trackingCode}`;
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pedido aprobado</title>
      ${styles}
    </head>
    <body>
      <header>
        <h1>¡Gracias por tu compra!</h1>
      </header>
      <main>
        <p>Tu pedido ha sido aprobado y está siendo procesado.</p>
        <p>
          <a class="activate-button" href="${trackingUrl}">
            Ver seguimiento: ${trackingCode}
          </a>
        </p>
        <h3>Resumen del pedido:</h3>
        <ul>
          ${items
            .map(
              (item) =>
                `<li>${item.quantity} x ${item.product.name} (${item.size})</li>`,
            )
            .join('')}
        </ul>
        <p>Total: $${total}</p>
      </main>
      <footer>
        <p>&copy; ${new Date().getFullYear()} Tu Empresa</p>
      </footer>
    </body>
    </html>
  `;
};
