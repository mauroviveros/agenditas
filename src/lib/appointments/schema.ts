import { z } from "zod";

// Las mismas reglas que appointments y create/move_appointment: el formulario avisa antes de llegar
// a la base, y la base sigue siendo la última palabra. Las claves van en snake_case porque son las
// de la RPC y pasan tal cual.
export const CLIENT_NAME_MAX = 80;
export const CLIENT_PHONE_MAX = 30;
// La hora se escribe de a 5 minutos, como la duración de los servicios.
const TIME_STEP_MINUTES = 5;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const daySchema = z.iso.date("Elegí un día.");

const timeSchema = z
  .string("Poné la hora como HH:mm, por ejemplo 14:45.")
  .regex(TIME_PATTERN, "Poné la hora como HH:mm, por ejemplo 14:45.")
  .refine((time) => Number(time.slice(3)) % TIME_STEP_MINUTES === 0, {
    message: "Poné la hora de a 5 minutos: 14:45 o 14:50.",
  });

export const appointmentSchema = z.object({
  service_id: z.uuid("Elegí un servicio."),
  client_name: z
    .string("Poné el nombre del cliente.")
    .trim()
    .min(1, "Poné el nombre del cliente.")
    .max(CLIENT_NAME_MAX, `El nombre tiene hasta ${CLIENT_NAME_MAX} caracteres.`),
  // Vacío, ausente o null es «sin teléfono» (null es lo que sale de este mismo esquema). Va tal cual lo escribió el solista: el formato no se cuida.
  client_phone: z
    .string()
    .trim()
    .max(CLIENT_PHONE_MAX, `El teléfono tiene hasta ${CLIENT_PHONE_MAX} caracteres.`)
    .nullish()
    .transform((phone) => phone || null),
  day: daySchema,
  time: timeSchema,
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const moveSchema = z.object({
  id: z.uuid("No encontramos ese turno."),
  day: daySchema,
  time: timeSchema,
});

export type MoveInput = z.infer<typeof moveSchema>;
