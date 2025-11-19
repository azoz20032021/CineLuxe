import { useState } from 'react';
import './SignIn.css';
import Button from '@mui/material/Button';
import axios, { isAxiosError } from 'axios'; 


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://cine-luxe-delta.vercel.app';


export default function SignIn() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'verify' | 'success'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleNext() {
    setLoading(true);
    setError('');

    try {
      if (step === 'email') {
        
        const response = await axios.post(`${BACKEND_URL}/send-code`, { 
            email: email 
        });

        if (response.status === 200) {
            setStep('verify');
        }
        
      } else if (step === 'verify') {
        
        const verificationResponse = await axios.post(`${BACKEND_URL}/verify-code`, {
            email: email,
            code: code
        });
        
        if (verificationResponse.data.success) {
            setStep('success');
        } 
      }
    } catch (err) {
  if (isAxiosError(err)) {
  const msg = err.response?.data?.error || 'An unknown server error occurred.';
  setError(msg);
} else {
  setError('An unexpected error occurred. Please try again.');
  console.error("Unexpected error:", err);
  }
  if (step === 'email') {
      setStep('email'); 
  }
} finally {
  setLoading(false);
}
  }

  return (
    <main className="sign-in-page">
      <div className="sign-in-card">
        <h1>Sign In</h1>
        
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>} 

        {step === 'email' && (
          <div className="form-group">
            <p>Enter your email address to receive a verification code.</p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address"
              autoFocus
            />
            <Button
              onClick={handleNext}
              disabled={!email || loading}
              variant="contained"
              sx={{
                background: "linear-gradient(90deg,#b6912bc8,#ffc422c8)",
                transition: "all 0.3s",
                marginTop: "20px",
                "&:hover": {
                  transform: "scale(0.98)",
                  boxShadow: "0 0 15px #d7d7d75b",
                },
              }}
            >
              {loading ? 'Sending...' : 'Next'}
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="form-group">
            <p>Enter the verification code sent to {email}</p>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Verification code"
              maxLength={6}
              autoFocus
            />
            <Button
              onClick={handleNext}
              disabled={!code || loading}
              variant="contained"
              sx={{
                background: "linear-gradient(90deg,#b6912bc8,#ffc422c8)",
                transition: "all 0.3s",
                marginTop: "20px",
                "&:hover": {
                  transform: "scale(0.98)",
                  boxShadow: "0 0 15px #d7d7d75b",
                },
              }}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
            <button 
              className="text-button"
              onClick={() => setStep('email')}
              disabled={loading}
            >
              Use different email
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="success-message">
            <h2>Successfully verified!</h2>
            <p>Your email has been verified and your account is ready.</p>
            <Button
              onClick={() => window.location.href = '/'}
              variant="contained"
              sx={{
                background: "linear-gradient(90deg,#b6912bc8,#ffc422c8)",
                transition: "all 0.3s",
                marginTop: "20px",
                "&:hover": {
                  transform: "scale(0.98)",
                  boxShadow: "0 0 15px #d7d7d75b",
                },
              }}
            >
              Continue to Home
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}