import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { Trash2 } from 'lucide-react';
import AddStaffModal from '../components/staff/AddStaffModal';

function Staff() {
  const { user } = useAuth();
  
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); 
  
  // Delete state
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    setLoading(true);
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

  const handleDelete = async () => {
    if (!staffToDelete) return;
    
    // Prevent admin from deleting themselves
    if (staffToDelete.id === user.id) {
      alert("You cannot delete your own account.");
      setStaffToDelete(null);
      return;
    }

    setIsDeleting(true);

    const { error } = await supabase.rpc('delete_staff_account', {
      staff_id: staffToDelete.id
    });

    if (error) {
      alert("Error deleting staff: " + error.message);
    } else {
      setStaffToDelete(null);
      fetchStaff(); // Refresh list
    }
    setIsDeleting(false);
  };

  const filteredStaff = staffList.filter((person) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      person.full_name?.toLowerCase().includes(searchLower) ||
      person.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="max-w-5xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl text-neutral-900 mb-1 font-normal">Staff</h1>
          <p className="text-lg text-neutral-800">Manage your team's access</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 text-white text-lg px-6 py-2 rounded-sm hover:bg-primary-700 transition"
        >
          + Add staff
        </button>
      </div>

      <div className="mb-6 max-w-sm">
        <input 
          type="text" 
          placeholder="Search my Name/Email" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-neutral-400 rounded-none text-lg focus:outline-none focus:border-primary-600"
        />
      </div>

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
                    {person.email || 'No email'}
                  </td>
                  <td className="px-4 py-3 border-r border-neutral-400 capitalize">{person.role}</td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => setStaffToDelete(person)}
                      title="Remove Staff"
                      className="cursor-pointer p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={20} className="mx-auto" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddStaffModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onStaffAdded={fetchStaff} 
      />

      {/* Delete Confirmation Modal */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setStaffToDelete(null)}></div>
          
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="text-red-600" size={24} />
            </div>
            
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Remove Staff Member?</h3>
            <p className="text-sm text-neutral-500 mb-6">
              Are you sure you want to remove <strong className="text-neutral-900">{staffToDelete.full_name}</strong>? They will immediately lose access to the system.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setStaffToDelete(null)}
                className="flex-1 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Staff;