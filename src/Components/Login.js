import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase'; // Ensure Firebase is configured properly

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false); // Handle loading state
  const navigate = useNavigate();

  const adminEmails = ['dev@gmail.com', 'admin@example.com'];

  // List of evaluator emails mapped to their dashboard paths
  const evaluatorEmails = {
    'charles.coscos@example.com': '/dashboard/evaluator/charles',
    'caryl.apa@example.com': '/dashboard/evaluator/caryl',
    'patrick.paclibar@greenergy.com': '/dashboard/evaluator/patrick',
    'vincent.go@greenergy.com': '/dashboard/evaluator/vincent',
    'jayr@greenergy.com': '/dashboard/evaluator/jay',
    'rodel.bartolata@greenergy.com': '/dashboard/evaluator/rodel',
    'tristan@greenergy.com': '/dashboard/evaluator/tristan',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous error message
    setLoading(true); // Set loading to true

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the user is an admin
      if (adminEmails.includes(user.email)) {
        navigate('/dashboard/admin');
      } 
      // Check if the user is an evaluator
      else if (evaluatorEmails[user.email]) {
        navigate(evaluatorEmails[user.email]); // Redirect to the specific evaluator dashboard
      } 
      // Check if the user is a requester
      else if (user.email === 'requester@example.com') {
        navigate('/dashboard/requester');
      } 
      // Default redirect if none of the above roles match
      else {
        navigate('/dashboard');
      }
    } catch (error) {
      // Handle common Firebase errors
      if (error.code === 'auth/wrong-password') {
        setErrorMessage('Incorrect password. Please try again.');
      } else if (error.code === 'auth/user-not-found') {
        setErrorMessage('No user found with this email.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Invalid email format.');
      } else {
        setErrorMessage('Login failed. Please try again later.');
      }
    }

    setLoading(false); // Stop loading
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setErrorMessage(''); // Clear error message on input change
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={handleInputChange(setEmail)} // Handle email input change
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={handleInputChange(setPassword)} // Handle password input change
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
}

export default Login;
