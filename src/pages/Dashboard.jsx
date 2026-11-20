import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Real data states
  const [totalProducts, setTotalProducts] = useState(0);
  const [todaysSales, setTodaysSales] = useState(0);
  const [salesCount, setSalesCount] = useState(0);
  const [lowStock, setLowStock] = useState([]);
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // 1. Fetch Products (for Total Count & Low Stock)
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('*');
      
      if (prodError) throw prodError;

      if (products) {
        setTotalProducts(products.length);
        // Filter for low stock (quantity <= reorder_level)
        const low = products.filter(p => p.quantity <= p.reorder_level);
        setLowStock(low);
      }

      // 2. Fetch Sales (for Today's Sales & Recent)
      // We get all sales for now, sorted by newest
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (salesError) throw salesError;

      if (sales) {
        // Calculate Today's Sales
        const today = new Date().toISOString().split('T')[0];
        const todaySalesData = sales.filter(s => s.created_at.startsWith(today));
        
        const totalRevenue = todaySalesData.reduce((sum, sale) => sum + Number(sale.total), 0);
        setTodaysSales(totalRevenue);
        setSalesCount(todaySalesData.length);

        // Set recent 2 sales for the panel
        setRecentSales(sales.slice(0, 2));
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-neutral-600">Loading dashboard data...</div>;
  }

  return (
    <div className="max-w-5xl">
      {/* Header section */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl text-neutral-900 mb-2 font-normal">Dashboard</h1>
          <p className="text-lg text-neutral-800">Overview of your inventory</p>
        </div>
        {/* Only show New Sale if not admin? Or show always? We'll keep it for now */}
        <button className="bg-primary-600 text-white text-lg px-6 py-2 rounded-sm hover:bg-primary-700 transition">
          + New sale
        </button>
      </div>

      {/* Stat Cards - Now using dynamic data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="border border-neutral-300 rounded-md p-4 min-h-[140px]">
          <div className="text-4xl text-neutral-900 mb-1">{totalProducts}</div>
          <div className="text-xl text-neutral-900 leading-tight">Products<br />in stock</div>
        </div>
        
        <div className="border border-neutral-300 rounded-md p-4 min-h-[140px]">
          <div className="text-4xl text-neutral-900 mb-1">
            {todaysSales.toLocaleString()}
          </div>
          <div className="text-xl text-neutral-900 leading-tight">Today's<br />sales (kes)</div>
        </div>
        
        <div className="border border-neutral-300 rounded-md p-4 min-h-[140px]">
          <div className="text-4xl text-neutral-900 mb-1">{salesCount}</div>
          <div className="text-xl text-neutral-900 leading-tight">Sales today</div>
        </div>
      </div>

      {/* Bottom Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Low Stock Panel */}
        <div className="border border-neutral-300 rounded-md p-4">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl text-neutral-900">Low stock ({lowStock.length})</h3>
            <button className="bg-[#138A7C] text-white px-3 py-1 text-sm rounded-sm">View all</button>
          </div>
          
          <div className="space-y-1 text-lg text-neutral-900">
            {lowStock.length === 0 ? (
              <p className="text-neutral-500 text-sm">All stock levels are healthy.</p>
            ) : (
              lowStock.slice(0, 3).map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name}</span> 
                  <span>: {item.quantity} - {item.quantity === 0 ? 'Out' : 'Low'}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Sales Panel */}
        <div className="border border-neutral-300 rounded-md p-4">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl text-neutral-900">Recent sales</h3>
            <button className="bg-[#138A7C] text-white px-3 py-1 text-sm rounded-sm">View all</button>
          </div>
          
          <div className="space-y-2 text-lg text-neutral-900">
            {recentSales.length === 0 ? (
              <p className="text-neutral-500 text-sm">No sales recorded yet.</p>
            ) : (
              recentSales.map((sale) => {
                const time = new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={sale.id}>
                    <div className="flex gap-2 items-center">
                      <span className="text-2xl">•</span> 
                      <span>{time} - {sale.staff_name}</span>
                    </div>
                    <div className="ml-5">
                      {sale.items?.length || 0} items; {Number(sale.total).toLocaleString()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;