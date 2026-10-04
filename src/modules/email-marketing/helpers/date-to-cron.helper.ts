export function convertDateToCron(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  // Formato cron: minutos horas día mes * (no incluir el año para evitar errores)
  return `${minute} ${hour} ${day} ${month} *`;
}
