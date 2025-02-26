export function generatePassword(): string {
  const lengthPassword = 16;

  const alpha = 'abcdefghijklmnopqrstuvwxyz123456789';
  let password = '';
  for (let i = 0; i < lengthPassword; i++)
    password = password.concat(
      alpha[Math.floor(Math.random() * (alpha.length - 1))],
    );
  return password;
}
