import { useState } from "react";
import { auth, provider, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (error) {
      alert("Login error: " + error.message);
    }
  };

  const loginWithGoogle = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithPopup(auth, provider);

      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;

      if (accessToken) {
        localStorage.setItem("googleAccessToken", accessToken);
      }

      const user = result.user;

      // Check if Firestore user doc exists
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          joined: serverTimestamp(),
        });
      }

      navigate("/home");
    } catch (error) {
      console.error("Login error:", error.message);
    }
  };

  return (
    <div className="wrapper-login">
      <form>  
      <h2 className="text-4xl text-center">Sign in</h2>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
        className="my-[0.3rem] rounded-md p-[0.9rem]"
          onClick={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          Log In
        </button>

        <button
        className="my-[0.3rem] rounded-md p-[0.9rem]" 
        onClick={loginWithGoogle}>Sign In with Google</button>

        <button
        className="my-[0.3rem] rounded-md p-[0.9rem]"
          type="button"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </button>
      </form>

      <div className="info-login">
        <p>
          jaedfjkeafjkwjrkaJKEAJDGM K ADJFJAFJJKASDJKJKF
          JAKEFAJRNJAERKASKARKKJRA KJA KSNJASNFAKFKJAFKJ EQKJRA EKJKAK FFASZCX
        </p>
        <img src="https://media.streets.mn/wp-content/uploads/2013/10/Screen-shot-2013-10-27-at-10.51.49-PM-500x288.png" alt="Info" />
      </div>
    </div>
  );
}

export default Login;