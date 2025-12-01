export interface UbicacionDTO {
  provincia: string;
  municipio: string;
  localidad: string;
}

export interface UserDTO {
  id: string;
  authId: string;            // viene del backend como authId (mapeado desde auth0Id)
  telegramId?: string | null;
  name: string;
  mail: string;
  phoneNumber?: string | null;
  sueldo?: number | null;
  profesion?: string | null;
  estadoCivil?: string | null;
  ubicacion?: UbicacionDTO | null;
  ingreso_mensual: number;

  // Si en tu base/ORM agregás timestamps, podés incluirlos opcionalmente:
  createdAt?: string;
  updatedAt?: string;

  // Si tu backend también devuelve 'situacion_laboral' en snake_case, agregalo:
  situacion_laboral?: string | null;
}
