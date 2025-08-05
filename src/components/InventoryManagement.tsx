

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { InventoryItem } from '@/types';
import { Button } from '@/components/ui/button';
import InventoryForm from './inventory/InventoryForm';
import InventoryCard from './inventory/InventoryCard';
import InventorySearch from './inventory/InventorySearch';
import EmptyInventoryState from './inventory/EmptyInventoryState';
import { supabase } from '@/lib/supabaseClient';
import Pagination from './pagination';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);


  const [formData, setFormData] = useState({
    stockName: '',
    quantity: '',
    price: '',
    stockCode: '',
    threshold: '',
  });

  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from('Inventory')
      .select('*')
      .order('dateAdded', { ascending: false });

    if (error) {
      console.error(error.message);
      alert('Error fetching inventory: ' + error.message); // 🛠️ Use alert for simplicity
    } else {
      setInventory(data || []);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter(item =>
    item.stockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.stockCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!formData.stockName || !formData.quantity || !formData.price || !formData.stockCode || !formData.threshold) {
  //     toast({
  //       title: "Error",
  //       description: "Please fill in all fields",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   const newItem = {
  //     stockName: formData.stockName,
  //     quantity: parseInt(formData.quantity),
  //     price: parseFloat(formData.price),
  //     stockCode: formData.stockCode,
  //     threshold: parseInt(formData.threshold),
  //     dateAdded: editingItem ? editingItem.dateAdded : new Date().toISOString().split('T')[0],
  //   };

  //   if (editingItem) {
  //     const { error } = await supabase
  //       .from('Inventory')
  //       .update(newItem)
  //       .eq('id', editingItem.id);

  //     if (error) {
  //       toast({ title: 'Error', description: error.message, variant: 'destructive' });
  //     } else {
  //       toast({ title: 'Success', description: 'Item updated successfully' });
  //     }
  //   } else {
  //     const { error } = await supabase.from('Inventory').insert([newItem]);

  //     if (error) {
  //       toast({ title: 'Error', description: error.message, variant: 'destructive' });
  //     } else {
  //       toast({ title: 'Success', description: 'Item added successfully' });
  //     }
  //   }

  //   resetForm();
  //   fetchInventory();
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.stockName ||
      !formData.quantity ||
      !formData.price ||
      !formData.stockCode ||
      !formData.threshold
    ) {
      alert('Please fill in all fields'); // 🛠️ Use alert for simplicity
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
     alert('User not authenticated. Please log in.');
      return;
    }

    const newItem = {
      stockName: formData.stockName,
      quantity: parseInt(formData.quantity),
      price: parseFloat(formData.price),
      stockCode: formData.stockCode,
      threshold: parseInt(formData.threshold),
      dateAdded: editingItem
        ? editingItem.dateAdded
        : new Date().toISOString().split("T")[0],
      user_id: user.id, // ✅ RLS requirement
    };

    if (editingItem) {
      const { error } = await supabase
        .from("Inventory")
        .update(newItem)
        .eq("id", editingItem.id)
        .eq("user_id", user.id); // ✅ Ensure user can only update their own row

      if (error) {
        alert('Error updating item: ' + error.message); // 🛠️ Use alert for simplicity
      } else {
        alert('Item updated successfully'); // 🛠️ Use alert for simplicity
      }
    } else {
      const { error } = await supabase.from("Inventory").insert([newItem]);

      if (error) {
       alert('Error adding item: ' + error.message);
      } else {
        alert('Item added successfully');
      }
    }

    resetForm();
    fetchInventory();
  };

  const resetForm = () => {
    setFormData({
      stockName: '',
      quantity: '',
      price: '',
      stockCode: '',
      threshold: '',
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      stockName: item.stockName,
      quantity: item.quantity.toString(),
      price: item.price.toString(),
      stockCode: item.stockCode,
      threshold: item.threshold.toString(),
    });
    setIsDialogOpen(true);
  };

  // const handleDelete = async (id: string) => {
  //   const { error } = await supabase.from('Inventory').delete().eq('id', id);

  //   if (error) {
  //     toast({ title: 'Error', description: error.message, variant: 'destructive' });
  //   } else {
  //     toast({ title: 'Success', description: 'Item deleted successfully' });
  //     fetchInventory();
  //   }
  // };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this item?');

    if (!confirmDelete) return; // 🛑 Cancel if user doesn't confirm

    const { error } = await supabase.from('Inventory').delete().eq('id', id);

    if (error) {
      alert('Error deleting item: ' + error.message);
    } else {
     alert('Item deleted successfully');
      fetchInventory(); // 🔁 Refresh the inventory list
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-2">Manage your stock and monitor low inventory alerts</p>
        </div>

        <>
          <Button
            className="flex items-center space-x-2"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus size={20} />
            <span>{editingItem ? 'Edit Item' : 'Add Item'}</span>
          </Button>

          {isDialogOpen && (
            <InventoryForm
              isOpen={isDialogOpen}
              onClose={resetForm}
              onSubmit={handleSubmit}
              formData={formData}
              setFormData={setFormData}
              editingItem={editingItem}
            />
          )}
        </>

      </div>

      <InventorySearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Vertical list layout instead of grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-4 text-sm p-1 font-black text-gray-700 border-b pb-1">
        <span>Item Name</span>
        <span>HSN/SAC Code</span>
        <span>Quantity</span>
        <span>Price</span>
        <span>Threshold</span>
        <span className="col-span-1 lg:col-span-1">Actions</span>
      </div>
      <div className="space-y-4">
        {paginatedInventory.map((item) => (
          <InventoryCard
            key={item.id}
            item={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {paginatedInventory.length === 0 && (
        <EmptyInventoryState searchTerm={searchTerm} />
      )}
      {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default InventoryManagement;