import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import AddStaffModal from '../components/staff/AddStaffModal';
import ProductFormModal from '../components/products/ProductFormModal';

function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [totalProducts, setTotalProducts] = useState(0);
    const [todaysSales, setTodaysSales] = useState(0);
    const [salesCount, setSalesCount] = useState(0);
    const [lowStock, setLowStock] = useState([]);
    const [recentSales, setRecentSales] = useState([]);

    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    // Moved fetchData outside useEffect so we can call it after adding a product
    async function fetchData() {
        if (!user) return;

        setLoading(true);
        try {
            const { data: products } = await supabase.from('products').select('*');
            const { data: sales } = await supabase.from('sales').select('*').order('created_at', { ascending: false });

            if (products) {
                setTotalProducts(products.length);
                setLowStock(products.filter(p => p.quantity <= p.reorder_level));
            }
            if (sales) {
                const today = new Date().toISOString().split('T')[0];
                const todayData = sales.filter(s => s.created_at.startsWith(today));
                setTodaysSales(todayData.reduce((sum, s) => sum + Number(s.total), 0));
                setSalesCount(todayData.length);
                setRecentSales(sales.slice(0, 2));
            }
        } catch (error) {
            console.error("Error fetching dashboard:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!authLoading && user) {
            fetchData();
        }
    }, [user, authLoading]);

    if (authLoading) return <div className="p-8 text-neutral-600">Loading user...</div>;

    return (
        <div className="max-w-5xl">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-3xl text-neutral-900 mb-2 font-normal">Admin Dashboard</h1>
                    <p className="text-lg text-neutral-800">Overview of your inventory</p>
                </div>

                <button
                    onClick={() => setIsProductModalOpen(true)}
                    className="bg-primary-600 text-white text-lg px-6 py-2 rounded-sm hover:bg-primary-700 transition"
                >
                    + Add product
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="border border-neutral-300 rounded-md p-4 min-h-[140px]">
                    <div className="text-4xl text-neutral-900 mb-1">{totalProducts}</div>
                    <div className="text-xl text-neutral-900 leading-tight">Products<br />in stock</div>
                </div>
                <div className="border border-neutral-300 rounded-md p-4 min-h-[140px]">
                    <div className="text-4xl text-neutral-900 mb-1">{todaysSales.toLocaleString()}</div>
                    <div className="text-xl text-neutral-900 leading-tight">Today's<br />sales (kes)</div>
                </div>
                <div className="border border-neutral-300 rounded-md p-4 min-h-[140px]">
                    <div className="text-4xl text-neutral-900 mb-1">{salesCount}</div>
                    <div className="text-xl text-neutral-900 leading-tight">Sales today</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="border border-neutral-300 rounded-md p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-xl text-neutral-900">Low stock ({lowStock.length})</h3>
                        <button className="bg-[#138A7C] text-white px-3 py-1 text-sm rounded-sm">View all</button>
                    </div>
                    <div className="space-y-1 text-lg text-neutral-900">
                        {lowStock.length === 0 ? <p className="text-neutral-500 text-sm">All stock levels are healthy.</p> :
                            lowStock.slice(0, 3).map((item) => (
                                <div key={item.id} className="flex justify-between border-b border-neutral-100 pb-1">
                                    <span>{item.name}</span>
                                    <span>: {item.quantity} - {item.quantity === 0 ? 'Out' : 'Low'}</span>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="border border-neutral-300 rounded-md p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-xl text-neutral-900">Recent sales</h3>
                        <button className="bg-[#138A7C] text-white px-3 py-1 text-sm rounded-sm">View all</button>
                    </div>
                    <div className="space-y-2 text-lg text-neutral-900">
                        {recentSales.length === 0 ? <p className="text-neutral-500 text-sm">No sales recorded yet.</p> :
                            recentSales.map((sale) => (
                                <div key={sale.id} className="border-b border-neutral-100 pb-1">
                                    <div className="flex gap-2 items-center">
                                        <span className="text-xl">•</span>
                                        <span>{new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {sale.staff_name}</span>
                                    </div>
                                    <div className="ml-5 text-neutral-600">{sale.items?.length || 0} items; {Number(sale.total).toLocaleString()}</div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="border border-neutral-300 rounded-md p-6">
                <h3 className="text-xl text-neutral-900 text-center mb-6 uppercase tracking-wider">Quick Actions</h3>
                <div className="flex justify-center gap-6">

                    <button
                        onClick={() => setIsStaffModalOpen(true)}
                        className="border border-neutral-300 px-6 py-3 text-lg text-neutral-900 hover:bg-neutral-50 rounded-sm transition"
                    >
                        + Add staff
                    </button>

                    <button
                        onClick={() => setIsProductModalOpen(true)}
                        className="border border-neutral-300 px-6 py-3 text-lg text-neutral-900 hover:bg-neutral-50 rounded-sm transition"
                    >
                        + Add product
                    </button>
                    <button
                        onClick={() => navigate('/admin/mfa-setup')}
                        className="bg-neutral-800 text-white px-4 py-2 rounded"
                    >
                        Setup MFA
                    </button>
                </div>
            </div>

            {/* Modals */}
            <AddStaffModal
                isOpen={isStaffModalOpen}
                onClose={() => setIsStaffModalOpen(false)}
                onStaffAdded={() => setIsStaffModalOpen(false)}
            />

            <ProductFormModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onProductAdded={() => {
                    setIsProductModalOpen(false);
                    fetchData();
                }}
            />
        </div>
    );
}

export default AdminDashboard;