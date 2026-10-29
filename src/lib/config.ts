/** Valores de ejemplo que usa docker-compose cuando no hay un .env configurado. */
export const DEV_JWT_SECRET = '0000000000000000000000000000000000000000000000000000000000000000'
export const DEV_CREDENTIALS_ENCRYPTION_KEY =
  '1111111111111111111111111111111111111111111111111111111111111111'

/**
 * Valida un secreto de entorno.
 * Si se usa el valor de ejemplo avisa por consola: en producción habría que
 * configurarlo en el .env del servidor.
 */
export function readSecret(name: string, placeholder: string): string {
  const value = process.env[name]
  if (!value || value.length < 32) {
    throw new Error(
      `${name} no configurada. Copia .env.example a .env y genera un valor con: openssl rand -hex 32`,
    )
  }
  if (value === placeholder) {
    console.warn(
      `[config] AVISO: ${name} usa el valor de ejemplo de docker-compose. Cámbiala antes de publicar la web.`,
    )
  }
  return value
}
