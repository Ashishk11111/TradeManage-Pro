import React from 'react';
import { Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface EmptyInventoryStateProps {
  searchTerm: string;
}

const EmptyInventoryState: React.FC<EmptyInventoryStateProps> = ({ searchTerm }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Card className="text-center py-12 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-none shadow-md">
        <CardContent>
          <div className="bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 p-4 rounded-full w-fit mx-auto mb-4">
            <Package size={40} className="text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No inventory items found</h3>
          <p className="text-gray-600">
            {searchTerm
              ? 'Try adjusting your search terms.'
              : 'Get started by adding your first inventory item.'}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EmptyInventoryState;
