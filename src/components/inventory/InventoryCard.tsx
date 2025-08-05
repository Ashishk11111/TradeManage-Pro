
// import React from 'react';
// import { Edit, Trash2, AlertTriangle } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { InventoryItem } from '@/types';

// interface InventoryCardProps {
//   item: InventoryItem;
//   onEdit: (item: InventoryItem) => void;
//   onDelete: (id: string) => void;
// }

// const InventoryCard: React.FC<InventoryCardProps> = ({ item, onEdit, onDelete }) => {
//   const isLowStock = item.quantity <= item.threshold;

//   return (
//     <Card className={`hover:shadow-lg transition-shadow ${isLowStock ? 'border-red-200 bg-red-50' : ''}`}>
//       {/* <CardHeader className="pb-3">
//         <div className="flex items-start justify-between">
//           <div>
//             <CardTitle className="text-lg">{item.stockName}</CardTitle>
//             <p className="text-sm text-gray-600">Code: {item.stockCode}</p>
//           </div>
//           {isLowStock && (
//             <AlertTriangle className="h-5 w-5 text-red-500" />
//           )}
//         </div>
//       </CardHeader> */}
      
//       <div>

//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-4 text-sm p-1" >

//         <span className="text-sm text-gray-600">{item.stockName}</span>
//         <span className="text-sm text-gray-600">{item.stockCode}</span>
//         <span  className={`font-semibold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>{item.quantity}</span>
//         <span className="font-semibold text-gray-900">₹{item.price.toFixed(2)}</span>
//         <span className="text-sm text-gray-600">{item.threshold}</span>
//         {/* <span className="font-semibold text-gray-900">{item.dateAdded}</span> */}
//       <div>

//         <Button
//           variant="ghost"
//           // size="sm"
//           onClick={() => onEdit(item)}
//           className="flex-1"
//         >
//           <Edit size={16} className="" />
          
//         </Button>
//         <Button
//           variant="ghost"
//           // size="sm"
//           onClick={() => onDelete(item.id)}
//           className="flex-1 text-red-600 hover:text-red-700"
//         >
//           <Trash2 size={16} className="" />
          
//         </Button>
//       </div>
      
//       </div>
//           {isLowStock && (
            
//               <p className="text-red-700 text-xs font-medium pb-2 pl-4">⚠️ Low Stock Alert</p>
//           )}
//       </div>
//       {/* <CardContent className="space-y-3">
//         <div className="grid grid-cols-2 gap-4 text-sm">
//           <div>
//             <p className="text-gray-600">Quantity</p>
//             <p className={`font-semibold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
//               {item.quantity}
//             </p>
//           </div>
//           <div>
//             <p className="text-gray-600">Price</p>
//             <p className="font-semibold text-gray-900">${item.price.toFixed(2)}</p>
//           </div>
//           <div>
//             <p className="text-gray-600">Threshold</p>
//             <p className="font-semibold text-gray-900">{item.threshold}</p>
//           </div>
//           <div>
//             <p className="text-gray-600">Added</p>
//             <p className="font-semibold text-gray-900">{item.dateAdded}</p>
//           </div>
//         </div>
        
//         {isLowStock && (
//           <div className="bg-red-100 border border-red-200 rounded-lg p-2">
//             <p className="text-red-700 text-xs font-medium">⚠️ Low Stock Alert</p>
//           </div>
//         )}

//       </CardContent> */}

//     </Card>
//   );
// };



// export default InventoryCard;


import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InventoryItem } from '@/types';

interface InventoryCardProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

const InventoryCard: React.FC<InventoryCardProps> = ({ item, onEdit, onDelete }) => {
  const isLowStock = item.quantity <= item.threshold;

  return (
    <Card className={`hover:shadow-lg transition-shadow relative ${isLowStock ? 'border-red-200 bg-red-50' : ''}`}>
      {/* Low Stock Badge */}
      {isLowStock && (
        <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
          Low Stock
        </span>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-4 text-sm p-1">
        <span className="text-sm text-gray-600">{item.stockName}</span>
        <span className="text-sm text-gray-600">{item.stockCode}</span>
        <span className={`font-semibold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>{item.quantity}</span>
        <span className="font-semibold text-gray-900">₹{item.price.toFixed(2)}</span>
        <span className="text-sm text-gray-600">{item.threshold}</span>

        <div className="flex gap-2 col-span-2">
          <Button
            variant="ghost"
            onClick={() => onEdit(item)}
            className="flex-1"
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="ghost"
            onClick={() => onDelete(item.id)}
            className="flex-1 text-red-600 hover:text-red-700"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default InventoryCard;
