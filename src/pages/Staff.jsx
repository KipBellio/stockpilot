import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { Pencil } from 'lucide-react';

function Staff() {
  const { user } = useAuth();
  
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    setLoading(true);
    // Fetch all profiles from Supabase
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      console.error("Error fetching staff:", error);
    } else {
      setStaffList(data || []);
    }
    setLoading(false);
  }

  // Filter by name or email
  const filteredStaff = staffList.filter((person) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      person.full_name?.toLowerCase().includes(searchLower) ||
      person.email?.toLowerCase().includes(searchLower) // Note: email might not be in profiles table yet
    );
  });

  return (
    <div className="max-w-5xl">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl text-neutral-900 mb-1 font-normal">Staff</h1>
          <p className="text-lg text-neutral-800">Manage your team's access</p>
        </div>
        
        <button className="bg-primary-600 text-white text-lg px-6 py-2 rounded-sm hover:bg-primary-700 transition">
          + Add staff
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-sm">
        <input 
          type="text" 
          placeholder="Search my Name/Email" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-neutral-400 rounded-none text-lg focus:outline-none focus:border-primary-600"
        />
      </div>

      {/* Staff Table */}
      <div className="border border-neutral-400 rounded-none bg-white overflow-hidden">
        <table className="w-full text-left text-xl">
          <thead className="border-b border-neutral-400 text-neutral-900">
            <tr>
              <th className="px-4 py-3 font-normal border-r border-neutral-400 w-1/4">Name</th>
              <th className="px-4 py-3 font-normal border-r border-neutral-400 w-1/3">Email</th>
              <th className="px-4 py-3 font-normal border-r border-neutral-400 w-1/4">Roles</th>
              <th className="px-4 py-3 font-normal text-center w-16">...</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-400">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-neutral-500 text-base">Loading staff...</td>
              </tr>
            ) : filteredStaff.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-neutral-500 text-base">No staff found.</td>
              </tr>
            ) : (
              filteredStaff.map((person) => (
                <tr key={person.id} className="hover:bg-neutral-50 transition">
                  <td className="px-4 py-3 border-r border-neutral-400">{person.full_name}</td>
                  <td className="px-4 py-3 border-r border-neutral-400 truncate max-w-[200px]">
                    {person.email || 'No email in profile'}
                  </td>
                  <td className="px-4 py-3 border-r border-neutral-400 capitalize">{person.role}</td>
                  <td className="px-4 py-3 text-center cursor-pointer hover:bg-neutral-100 border-l border-transparent">
                    <Pencil size={20} className="mx-auto text-amber-500" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Staff;