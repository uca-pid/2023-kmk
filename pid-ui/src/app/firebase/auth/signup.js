import firebase_app from "../config";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import updateRole from "./updateRole.js";

const auth = getAuth(firebase_app);

export default async function signUp(email, password, role) {
  let result = null,
    error = null;
  try {
    result = await createUserWithEmailAndPassword(auth, email, password);
    await updateRole(result.user, role);
  } catch (e) {
    error = e;
  }

  return { result, error };
}
