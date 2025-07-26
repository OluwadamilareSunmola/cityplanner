import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      console.log('Logging in:', email);
      navigate('/home'); 
    } else {
    }
  };

  return (
    <div className="wrapper-login">
      <form onSubmit={handleSubmit}>
        <h2 >Login</h2>

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
          type="submit"
        >
          Sign In
        </button>
        <button onClick={(e) => navigate("/signup")}>Sign Up</button>
      </form>
      <div className="info-login">
        <p>
          jaedfjkeafjkwjrkaJKEAJDGM K ADJFJAFJJKASDJKJKF
          JAKEFAJRNJAERKASKARKKJRA KJA KSNJASNFAKFKJAFKJ EQKJRA EKJKAK FFASZCX
        </p>
        <img src="https://media.streets.mn/wp-content/uploads/2013/10/Screen-shot-2013-10-27-at-10.51.49-PM-500x288.png"></img>
      </div>
    </div>
  );
}

export default Login;