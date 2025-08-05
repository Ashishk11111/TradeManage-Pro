

import { useEffect, useState } from 'react';
import {
  Package,
  Users,
  FileText,
  AlertTriangle,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { InventoryItem, Client, Invoice } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const Dashboard = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [{ data: inventoryData, error: invErr }, { data: clientData, error: cliErr }] =
          await Promise.all([
            supabase.from('Inventory').select('*'),
            supabase.from('clientDetails').select('*'),
          ]);

        if (invErr || cliErr) {
          throw new Error(invErr?.message || cliErr?.message || 'Unknown error');
        }

        setInventory(inventoryData || []);
        setClients(clientData || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const lowStockItems = inventory.filter((item) => item.quantity <= item.threshold);
  const totalValue = inventory.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);

  const invoicesWithClient = invoices.map((inv) => ({
    ...inv,
    clientName: clients.find((c) => c.id === inv.clientId)?.name || 'Unknown',
  }));

  const stats = [
    {
      name: 'Total Inventory Items',
      value: inventory.length,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Total Clients',
      value: clients.length,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Invoices',
      value: invoices.length,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Low Stock Alerts',
      value: lowStockItems.length,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (error) return <p className="text-center text-red-600">Error: {error}</p>;
  const colors = [
    '#3B82F6', // blue-500
    '#10B981', // green-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
    '#0EA5E9', // sky-500
    '#22D3EE', // cyan-400
    '#F43F5E', // rose-500
  ];
  return (
    <div className="space-y-10">
      <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={0}>
        <h1 className="text-4xl font-extrabold text-gray-900">📊 Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your business management dashboard</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.name} variants={fadeIn} custom={i} initial="hidden" animate="visible">
              <Card className="hover:shadow-md hover:scale-[1.02] transition-transform bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Values */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeIn} custom={0} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
                <TrendingUp className="h-5 w-5 mr-2" />
                Inventory Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₹{totalValue.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">Total value of all inventory</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn} custom={1} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-700">
                <DollarSign className="h-5 w-5 mr-2" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₹{totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">Revenue from all invoices</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Charts */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Inventory Bar Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-600">Inventory Quantities</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inventory}>
              <XAxis dataKey="stockName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" radius={[4, 4, 0, 0]}>
                {inventory.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Pie Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-green-600">Revenue by Client</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={invoicesWithClient}
                dataKey="total"
                nameKey="clientName"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {invoicesWithClient.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <motion.div variants={fadeIn} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Card className="border-red-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.stockName}</p>
                      <p className="text-sm text-gray-600">Code: {item.stockCode}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{item.quantity} left</p>
                      <p className="text-sm text-gray-600">Threshold: {item.threshold}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
