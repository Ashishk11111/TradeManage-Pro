import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import PasswordGenerator from '../components/PasswordGenerator';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('email');
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('❌ Passwords do not match.');
      return;
    }

    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      localStorage.setItem('email', email);
      if (data.user?.id) {
        localStorage.setItem('user_id', data.user.id);
      }

      // ✅ No email confirmation required, move forward directly
      setMessage('✅ Registered successfully! Redirecting...');
      setTimeout(() => navigate('/SetupCompany'), 1500);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 border rounded shadow-md bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Create an Account</h2>

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <input
          className="border px-3 py-2 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            localStorage.setItem('email', e.target.value);
          }}
          required
          disabled={loading}
        />

        <input
          className="border px-3 py-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <input
          className="border px-3 py-2 rounded"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-center text-sm ${
            message.includes('✅') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}

      <PasswordGenerator
        onGenerate={(pw) => {
          setPassword(pw);
          setConfirmPassword(pw);
        }}
      />

      <p className="text-sm text-center mt-4">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-blue-600 underline hover:text-blue-800"
        >
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Register;
