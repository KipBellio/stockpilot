import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, UserPlus } from 'lucide-react';

function Staff() {
  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Staff</h1>
          <p className="text-sm text-neutral-500">Manage your team's access</p>
        </div>
        <button className="bg-primary-600 text-white text-sm px-4 py-2 rounded-md hover:bg-primary-700 transition flex items-center gap-2">
          <UserPlus size={16} /> Add staff
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            <tr className="hover:bg-neutral-50">
              <td className="px-6 py-4 font-medium text-neutral-900">Admin User</td>
              <td className="px-6 py-4 text-neutral-500">admin@stockpilot.com</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent-50 text-accent-600">Admin</span>
              </td>
            </tr>
            <tr className="hover:bg-neutral-50">
              <td className="px-6 py-4 font-medium text-neutral-900">John Staff</td>
              <td className="px-6 py-4 text-neutral-500">staff@stockpilot.com</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">Staff</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Staff;