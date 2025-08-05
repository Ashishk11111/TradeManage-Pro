
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InventoryItem } from '@/types';

interface InventoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    stockName: string;
    quantity: string;
    price: string;
    stockCode: string;
    threshold: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    stockName: string;
    quantity: string;
    price: string;
    stockCode: string;
    threshold: string;
  }>>;
  editingItem: InventoryItem | null;
}

const InventoryForm: React.FC<InventoryFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingItem
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-md mx-auto p-4 bg-white shadow-sm rounded-md">
  <h2 className="text-lg font-semibold text-gray-800">
    {editingItem ? 'Edit Item' : 'Add New Item'}
  </h2>

  <div>
    <Label htmlFor="stockName">Item Name</Label>
    <Input
      id="stockName"
      value={formData.stockName}
      onChange={(e) => setFormData({ ...formData, stockName: e.target.value })}
      placeholder="Enter stock name"
    />
  </div>

  <div>
    <Label htmlFor="stockCode">HSN/SAC Code</Label>
    <Input
      id="stockCode"
      value={formData.stockCode}
      onChange={(e) => setFormData({ ...formData, stockCode: e.target.value })}
      placeholder="Enter stock code"
    />
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="quantity">Quantity</Label>
      <Input
        id="quantity"
        type="number"
        value={formData.quantity}
        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
        placeholder="0"
      />
    </div>
    <div>
      <Label htmlFor="price">Price (₹)</Label>
      <Input
        id="price"
        type="number"
        step="0.01"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        placeholder="0.00"
      />
    </div>
  </div>

  <div>
    <Label htmlFor="threshold">Low Stock Threshold</Label>
    <Input
      id="threshold"
      type="number"
      value={formData.threshold}
      onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
      placeholder="Enter threshold"
    />
  </div>

  <div className="flex space-x-2 pt-4">
    <Button type="submit" className="flex-1">
      {editingItem ? 'Update' : 'Add'} Item
    </Button>
    <Button type="button" variant="outline" onClick={onClose}>
      Cancel
    </Button>
  </div>
</form>

  );
};

export default InventoryForm;




// import { InventoryItem } from '@/types';
// import { Button } from '@/components/ui/button';
// import {
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';

// interface InventoryFormProps {
//   onClose: () => void;
//   onSubmit: (e: React.FormEvent) => void;
//   formData: {
//     stockName: string;
//     quantity: string;
//     price: string;
//     stockCode: string;
//     threshold: string;
//   };
//   setFormData: (data: {
//     stockName: string;
//     quantity: string;
//     price: string;
//     stockCode: string;
//     threshold: string;
//   }) => void;
//   editingItem: InventoryItem | null;
// }

// const InventoryForm = ({
//   onClose,
//   onSubmit,
//   formData,
//   setFormData,
//   editingItem,
// }: InventoryFormProps) => {
//   const handleInputChange = (field: string, value: string) => {
//     setFormData({ ...formData, [field]: value });
//   };

//   return (
//     <DialogContent className="sm:max-w-[425px]">
//       <DialogHeader>
//         <DialogTitle>
//           {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
//         </DialogTitle>
//       </DialogHeader>
      
//       <form onSubmit={onSubmit} className="space-y-4">
//         <div className="space-y-2">
//           <Label htmlFor="stockName">Stock Name</Label>
//           <Input
//             id="stockName"
//             value={formData.stockName}
//             onChange={(e) => handleInputChange('stockName', e.target.value)}
//             placeholder="Enter stock name"
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="stockCode">Stock Code</Label>
//           <Input
//             id="stockCode"
//             value={formData.stockCode}
//             onChange={(e) => handleInputChange('stockCode', e.target.value)}
//             placeholder="Enter stock code"
//           />
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="quantity">Quantity</Label>
//             <Input
//               id="quantity"
//               type="number"
//               value={formData.quantity}
//               onChange={(e) => handleInputChange('quantity', e.target.value)}
//               placeholder="0"
//               min="0"
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="price">Price ($)</Label>
//             <Input
//               id="price"
//               type="number"
//               step="0.01"
//               value={formData.price}
//               onChange={(e) => handleInputChange('price', e.target.value)}
//               placeholder="0.00"
//               min="0"
//             />
//           </div>
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="threshold">Low Stock Threshold</Label>
//           <Input
//             id="threshold"
//             type="number"
//             value={formData.threshold}
//             onChange={(e) => handleInputChange('threshold', e.target.value)}
//             placeholder="Enter threshold"
//             min="0"
//           />
//         </div>

//         <div className="flex justify-end space-x-2 pt-4">
//           <Button type="button" variant="outline" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button type="submit">
//             {editingItem ? 'Update Item' : 'Add Item'}
//           </Button>
//         </div>
//       </form>
//     </DialogContent>
//   );
// };

// export default InventoryForm;