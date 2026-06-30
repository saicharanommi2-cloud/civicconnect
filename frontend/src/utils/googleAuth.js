import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    console.log("SUCCESS:", result.user);

    return result.user;
  } catch (error) {
    console.error("GOOGLE LOGIN ERROR");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error(error);

    alert(error.code + "\n\n" + error.message);

    return null;
  }
}