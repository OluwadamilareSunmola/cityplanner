import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";


function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  // Creates user profile from email
  const SignUpUser = async (email, name, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      //Adds user to db
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        joined: serverTimestamp(),
      });
      navigate("/home");
    } catch (error) {
      //gives an error message based on the type of error
      const errorCode = error.code;
      const errorMessage = error.message;
      
      switch (errorCode) {
        case "auth/weak-password":
          alert("Password is too weak. It should be at least 6 characters.");
          break;
        case "auth/invalid-email":
          alert("Invalid email address.");
          break;
        default:
          alert("Signup error: " + errorMessage);
          break;
      }
    }
  };

  //checks the fields are filled
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !name) return alert("Please fill in all fields");
    await SignUpUser(email, name, password);
  };

  return (
    <div className="wrapper-login">
      <form onSubmit={handleSignup}>
        <h2>Login</h2>

        <label>Name</label>
        <input className="mb-[1rem] px-0 py-[.8rem]"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label>Email</label>
        <input className="mb-[1rem] px-0 py-[.8rem]"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input className="mb-[1rem] px-0 py-[.8rem]"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="my-[0.3rem] rounded-md p-[0.8rem]"  type="submit" >Sign In</button>
        <button className="my-[0.3rem] rounded-md p-[0.8rem]"  onClick={() => navigate("/")}>Return</button>
      </form>
    </div>
  );
}

export default Signup;
