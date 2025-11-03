import { createContext, useContext, useState, useEffect } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import {
  signInWithPopup,
  RecaptchaVerifier,
  PhoneAuthProvider,
  multiFactor,
  PhoneMultiFactorGenerator,
  getAuth,
} from "firebase/auth";

interface AuthContextType {
  username: string | null;
  setUsername: (username: string | null) => void;
  logout: () => void;

  // New helpers
  signInWithGoogleAndEnrollPhone: (
    getPhone: () => Promise<string>,
    getSmsCode: () => Promise<string>
  ) => Promise<any>;
  signInWithGoogleHandleMfa: (
    promptForSmsCode: () => Promise<string>
  ) => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  username: null,
  setUsername: () => {},
  logout: () => {},
  signInWithGoogleAndEnrollPhone: async () => {},
  signInWithGoogleHandleMfa: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetch("http://localhost:8000/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setUsername(data?.username || null))
        .catch((error) => {
          console.log("Auth check failed:", error);
          setUsername(null);
        });
    } else {
      setUsername(null);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    setUsername(null);
  };

  async function signInWithGoogleAndEnrollPhone(
    getPhone: () => Promise<string>,
    getSmsCode: () => Promise<string>
  ) {
    const { user } = await signInWithPopup(auth, googleProvider);

    if (multiFactor(user).enrolledFactors.length === 0) {
      const mfaSession = await multiFactor(user).getSession();
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });

      const phoneProvider = new PhoneAuthProvider(auth);
      const phoneNumber = await getPhone();

      const verificationId = await phoneProvider.verifyPhoneNumber(
        { phoneNumber, session: mfaSession },
        verifier
      );

      const code = await getSmsCode();
      const cred = PhoneAuthProvider.credential(verificationId, code);
      const assertion = PhoneMultiFactorGenerator.assertion(cred);
      await multiFactor(user).enroll(assertion, "My Phone");
    }

    // OPTIONAL: Exchange Firebase ID token with your backend for your access token
    // const idToken = await user.getIdToken();
    // const res = await fetch("http://localhost:8000/firebase-login", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ idToken }),
    // });
    // const data = await res.json();
    // localStorage.setItem("access_token", data.access_token);
    // setUsername(data.username);

    return user;
  }

  async function signInWithGoogleHandleMfa(
    promptForSmsCode: () => Promise<string>
  ) {
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      return user;
    } catch (error: any) {
      if (error.code === "auth/multi-factor-auth-required") {
        // For now, just return the error - MFA handling can be implemented later
        console.log("MFA required but not implemented yet");
        throw error;
      }
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        username,
        setUsername,
        logout,
        signInWithGoogleAndEnrollPhone,
        signInWithGoogleHandleMfa,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}