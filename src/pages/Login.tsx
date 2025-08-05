import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom'; // 👈 make sure this is imported

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({
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

      setMessage('✅ Login successful! Redirecting...');
      setTimeout(() => navigate('/'), 1500);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 border rounded shadow-md bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          className="border px-3 py-2 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="border px-3 py-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-center text-sm ${message.includes('✅') ? 'text-green-600' : 'text-red-600'
            }`}
        >
          {message}
        </p>
      )}
      <p className="text-sm text-center mt-4">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 underline hover:text-blue-800">
          Register here
        </Link>
      </p>

    </div>
  );
};

export default Login;
