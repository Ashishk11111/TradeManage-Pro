
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface InventorySearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const InventorySearch: React.FC<InventorySearchProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      <Input
        placeholder="Search by name or code..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default InventorySearch;
