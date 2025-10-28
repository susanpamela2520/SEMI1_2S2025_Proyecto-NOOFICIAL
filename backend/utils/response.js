/**
 * Función para estandarizar las respuestas de la API
 * @param {import("express").Response} res - objeto response de Express
 * @param {boolean} success - éxito o fallo
 * @param {string} message - descripción
 * @param {object|array|null} data - contenido de respuesta
 * @param {number} statusCode - código HTTP
 */
export function makeResponse(res, success, message, data = {}, statusCode = 200) {
  const response = {
    success,
    message,
    data: data ?? {}
  };
  return res.status(statusCode).json(response);
}