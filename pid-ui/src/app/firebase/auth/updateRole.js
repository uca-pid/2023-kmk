import { updateProfile } from "firebase/auth";

export default async function updateRole(user, role) {
  try {
    // Actualiza el campo "role" en el perfil del usuario
    await updateProfile(user, { role });
  } catch (e) {
    console.error("Error al actualizar el rol del usuario:", e);
    throw e;
  }
  return e;
}