

import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, User } from 'lucide-react';
import { Client } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
type FormField = 'name' | 'email' | 'phoneNo' | 'address' | 'state' | 'pincode' | 'country' | 'gstNo';

const ClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  // const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNo: '',
    address: '',
    state: '',
    pincode: '',
    country: '',
    GSTIN: '',
  });
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clientDetails') // ✅ Check table name is correct and lowercase
        .select('*')
        .order('dateAdded', { ascending: false });

      if (error) {
        console.error('Supabase error:', error.message);
        alert('Failed to fetch clients. Please try again later.');

        return;
      }

      setClients(data ?? []); // ✅ Nullish coalescing (safer than `||`)
      // console.log('Fetched clients:', data);
    } catch (err: unknown) {
      // ✅ Handle unexpected errors
      if (err instanceof Error) {
        console.error('Unexpected error:', err.message);
        alert('An unexpected error occurred. Please try again later.');
      } else {
        alert('An unexpected error occurred. Please try again later.');
      }
    }
  };


  // ✅ Validation functions

  const validateEmail = (email: string): boolean => {
    // Basic RFC 5322-compliant regex, still readable and fast
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const validatePhone = (phoneNo: string): boolean => {
    // Allows optional '+' at start, digits, spaces, dashes, parentheses
    // Ensures at least 10 digits total
    const cleaned = phoneNo.replace(/[^\d]/g, ''); // Remove non-digits
    return cleaned.length == 10 && /^[+]?[\d\s\-()]+$/.test(phoneNo);
  };

  const validateGSTIN = (code: string) => {
    if (code.length !== 15) return false;
    const prefix = parseInt(code.slice(0, 2));
    return prefix >= 1 && prefix <= 36;
  };


  const resetForm = () => {
    setFormData({ name: '', email: '', phoneNo: '', address: '', state: '', pincode: '', country: '', GSTIN: '' });
    setEditingClient(null);
    setIsDialogOpen(false);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, phoneNo, address, state, country, pincode, GSTIN } = formData;

    // ✅ Validate required fields
    if (!name || !email || !phoneNo || !GSTIN) {
      alert('Please fill in all required fields (Name, Email, Phone, GSTIN)');
      return;
    }

    // ✅ Validate formats
    if (!validateEmail(email)) {
      alert('Invalid email format');
      return;
    }

    if (!validatePhone(phoneNo)) {
      alert('Invalid Phone number format');
      return;
    }

    if (!validateGSTIN(GSTIN)) {
      alert('Invalid GST no. format');
      return;
    }

    // ✅ Get current user
    // ✅ Get authenticated user from Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();


    if (userError || !user) {
      alert("User not authenticated. Please log in again.");
      return; // ✅ Moved inside the if block
    }

    // ✅ Destructure form data
    // const { name, email, phoneNo, address, state, country, pincode, GSTIN } = formData;

    // ✅ Prepare new client object
    const newClient = {
      id: editingClient ? editingClient.id : uuidv4(),
      name,
      email,
      phoneNo,
      address,
      state,
      country,
      pincode,
      GSTIN,
      dateAdded: editingClient ? editingClient.dateAdded : new Date(),
      user_id: user.id,
    };
    try {
      let error;

      if (editingClient) {
        // ✅ Update existing client
        ({ error } = await supabase
          .from("clientDetails")
          .update(newClient)
          .eq("id", editingClient.id)
          .eq("user_id", user.id)); // Ensure RLS

        if (!error) {
          alert("Client updated successfully.");
        }
      } else {
        // ✅ Insert new client
        ({ error } = await supabase
          .from("clientDetails")
          .insert([newClient]));

        if (!error) {
          alert("Client added successfully.");
        }
      }

      if (error) {
        if (error.code === "23505" || error.message.includes("duplicate")) {
          alert("Client with this email or GSTIN already exists. Please check and try again.");
        } else {
          alert("An error occurred while saving the client details. Please try again later.");
        }
        return; // ⛔ Stop further code if there's any error
      }

      // ✅ Only reset and refetch if there was no error
      resetForm();
      fetchClients();
    }
    catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred while saving the client details. Please try again later.");
    }
  }




  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phoneNo: client.phoneNo,
      address: client.address,
      state: client.state,
      pincode: client.pincode,
      country: client.country,
      GSTIN: client.GSTIN,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this client details?');
    if (!confirmDelete) return; // 🛑 Cancel if user doesn't confirm
    const { error } = await supabase.from('clientDetails').delete().eq('id', id);

    if (error) {
      alert('Error deleting client: ' + error.message);
      return;
    }

    alert('Client deleted successfully');
    // ✅ Refetch clients after deletion
    fetchClients();
  };


  // console.log(clients);
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phoneNo.includes(searchTerm) ||
    client.GSTIN.includes(searchTerm)
  );

  // console.log(filteredClients)

  return (
    <div className="space-y-6">
      {/* Header & Dialog */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-2">Manage your client database and contact information</p>
        </div>
        <div className="flex justify-end">
          <Button
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
            onClick={() => {
              resetForm(); // clear old data
              setIsDialogOpen(true); // open the form
            }}
          >
            <Plus size={16} className="mr-2" />
            Add Client
          </Button>
        </div>
       {isDialogOpen && (
  <form
    onSubmit={handleSubmit}
    className="w-full max-w-sm mx-auto px-4 py-3 bg-white shadow border border-gray-200 rounded-md text-xs space-y-2"
  >
    <h2 className="text-sm font-semibold text-gray-800 mb-2">
      {editingClient ? 'Edit Client' : 'Add New Client'}
    </h2>

    {/* Main Fields */}
    {(['name', 'email', 'phoneNo', 'address', 'GSTIN'] as FormField[]).map((field) => (
      <Input
        key={field}
        id={field}
        value={formData[field]}
        placeholder={field.charAt(0).toUpperCase() + field.slice(1) + (['name', 'email', 'phoneNo', 'GSTIN'].includes(field) ? ' *' : '')}
        onChange={(e) => {
          const value = e.target.value;
          if (field === 'gstNo') {
            if (value.length > 15) return;
            if (value.length >= 2) {
              const stateCode = parseInt(value.slice(0, 2), 10);
              if (isNaN(stateCode) || stateCode < 1 || stateCode > 34) return;
            }
          }
          setFormData({ ...formData, [field]: value });
        }}
        required={['name', 'email', 'phoneNo', 'GSTIN'].includes(field)}
        className="text-[11px] py-1 px-2 border-gray-300 placeholder-gray-400"
      />
    ))}

    {/* Grid Fields */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {(['state', 'country', 'pincode'] as FormField[]).map((field) => (
        <Input
          key={field}
          id={field}
          value={formData[field]}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
          className="text-[11px] py-1 px-2 border-gray-300 placeholder-gray-400"
        />
      ))}
    </div>

    {/* Buttons */}
    <div className="flex justify-end space-x-2 pt-1">
      <Button
        type="submit"
        className="text-xs px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
      >
        {editingClient ? 'Update' : 'Add'} Client
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={resetForm}
        className="text-xs px-3 py-1"
      >
        Cancel
      </Button>
    </div>
  </form>
)}




      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input placeholder="Search by name, email, or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      {/* Client List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card
            key={client.id}
            className="transition-transform hover:scale-[1.02] hover:shadow-xl border border-gray-200"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-2 rounded-full shadow-sm">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-blue-600 tracking-wide">
                      {client.GSTIN}
                    </CardTitle>
                    <p className="text-base font-medium text-gray-900">👤 {client.name}</p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <div>
                  <p className="text-gray-500">📧 Email</p>
                  <p className="font-medium text-gray-900 break-all">{client.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">📞 Phone</p>
                  <p className="font-medium text-gray-900">{client.phoneNo}</p>
                </div>
                <div>
                  <p className="text-gray-500">📍 Address</p>
                  <p className="font-medium text-gray-900">{client.address}</p>
                  {(client.state || client.country) && (
                    <p className="text-xs text-gray-500 italic">
                      {[client.state, client.country].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(client)}
                  className="flex-1 hover:bg-blue-50"
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(client.id)}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>


      {filteredClients.length === 0 && (
        <Card className="text-center py-12 bg-gradient-to-br from-blue-50 via-white to-purple-50 shadow-md animate-fade-in">
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-4 rounded-full shadow">
                <User size={48} className="text-white" />
              </div>
            </div>

            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent mb-2">
              No Clients Found
            </h3>

            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search terms.'
                : 'Get started by adding your first client.'}
            </p>
          </CardContent>
        </Card>
      )}

    </div>
  );

};
export default ClientManagement;