import React from 'react';
import { useCandidates } from '../context/CandidateContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Candidates() {
  const { candidates } = useCandidates();
  
  return (
    <div className="animate-in space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Candidates Database</h1>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
              <tr>
                <th className="px-5 py-4 font-medium">Name</th>
                <th className="px-5 py-4 font-medium">Email</th>
                <th className="px-5 py-4 font-medium">Role Evaluated</th>
                <th className="px-5 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map(c => (
                <tr key={c.id} className="border-b border-gray-50 dark:border-slate-700/50">
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">{c.name}</td>
                  <td className="px-5 py-4 text-gray-500">{c.email}</td>
                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300">{c.role}</td>
                  <td className="px-5 py-4 font-medium text-indigo-600 dark:text-indigo-400">{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
