import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const SetupCompany = () => {
  const [company, setCompany] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    gst_number: '',
  });
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [companyExists, setCompanyExists] = useState(false);

  const navigate = useNavigate();

  // Check if user is logged in and fetch existing company info
  // If no company exists, allow user to create one
  useEffect(() => {
    const getSessionAndCompany = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (sessionError || !user) {
        navigate('/login');
        return;
      }

      setUserId(user.id);

      // 1. Try to fetch existing company by owner_id
      const { data: existingCompany, error: fetchError } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      // if (existingCompany) {
      //   setCompany({
      //     name: existingCompany.name || '',
      //     address: existingCompany.address || '',
      //     phone: existingCompany.phone || '',
      //     email: existingCompany.email || '',
      //     gst_number: existingCompany.gst_number || '',
      //   });
      // } else {
      //   setCompany((prev) => ({ ...prev, email: user.email ?? '' }));
      // }
      if (existingCompany) {
        setCompanyExists(true); // ✅ set flag
        setCompany({
          name: existingCompany.name || '',
          address: existingCompany.address || '',
          phone: existingCompany.phone || '',
          email: existingCompany.email || '',
          gst_number: existingCompany.gst_number || '',
        });
      } else {
        setCompanyExists(false); // ✅ reset flag
        setCompany((prev) => ({ ...prev, email: user.email ?? '' }));
      }


      if (fetchError && fetchError.code !== 'PGRST116') {
        // Ignore "no rows returned" error (PGRST116)
        console.error('Error fetching company:', fetchError.message);
        setMessage('⚠️ Failed to load existing company info.');
      }
    };

    getSessionAndCompany();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompany((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission to create or update company
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setMessage('❌ User not authenticated.');
      navigate('/login');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Use upsert instead of insert
      const { data: upsertedCompany, error: companyError } = await supabase
        .from('companies')
        .upsert([
          {
            owner_id: userId,
            name: company.name,
            address: company.address,
            phone: company.phone,
            email: company.email,
            gst_number: company.gst_number,
          },
        ],{
          onConflict: 'owner_id', // Ensure we update existing company if owner_id matches
        })
        .select()
        .single();

      if (companyError) throw new Error(`Company update failed: ${companyError.message}`);

      // Upsert user profile as well
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          {
            id: userId,
            full_name: fullName,
            role: 'Admin',
            company_id: upsertedCompany.id,
          },
        ]);

      if (profileError) throw new Error(`Profile update failed: ${profileError.message}`);

      setMessage('✅ Company updated successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow-md bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Setup Your Company</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="name"
          placeholder="Company Name"
          className="border px-3 py-2 rounded"
          onChange={handleChange}
          value={company.name}
          required
          disabled={loading}
        />
        <input
          type="text"
          name="address"
          placeholder="Company Address"
          className="border px-3 py-2 rounded"
          onChange={handleChange}
          value={company.address}
          required
          disabled={loading}
        />
        <input
          type="text"
          name="phone"
          placeholder="Company Phone"
          className="border px-3 py-2 rounded"
          onChange={handleChange}
          value={company.phone}
          required
          disabled={loading}
        />
        <input
          type="email"
          name="email"
          placeholder="Company Email"
          className="border px-3 py-2 rounded"
          onChange={handleChange}
          value={company.email}
          required
          disabled={loading}
        />
        <input
          type="text"
          name="gst_number"
          placeholder="GST Number"
          className="border px-3 py-2 rounded"
          onChange={handleChange}
          value={company.gst_number}
          required
          disabled={loading}
        />


        <input
          type="text"
          placeholder="Your Full Name"
          className="border px-3 py-2 rounded"
          onChange={(e) => setFullName(e.target.value)}
          value={fullName}
          required
          disabled={loading}
        />

        {/* <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Setting up...' : 'Complete Setup'}
        </button> */}
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Saving...' : companyExists ? 'Update Company' : 'Create Company'}
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
    </div>
  );
};

export default SetupCompany;
