import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mail, CheckCircle2, Download, FileSpreadsheet } from 'lucide-react';
import { useCandidates } from '../context/CandidateContext';

export default function Shortlist() {
  const { getShortlisted } = useCandidates();
  const shortlisted = getShortlisted();
  const [mailSent, setMailSent] = useState(false);

  const handleSendMail = () => {
    if (shortlisted.length === 0) return;
    setMailSent(true);
    setTimeout(() => setMailSent(false), 3000);
  };

  const exportCSV = () => {
    if (shortlisted.length === 0) return;
    const headers = ['Name', 'Email', 'Role', 'Match Score', 'Experience', 'Education', 'Matched Skills', 'Missing Skills'];
    const rows = shortlisted.map(c => [
      `"${c.name}"`, `"${c.email}"`, `"${c.role}"`, `"${c.score}%"`, `"${c.experience} Years"`, `"${c.education}"`, `"${c.skills.join(', ')}"`, `"${c.missing}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "shortlisted_candidates.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = () => {
    if (shortlisted.length === 0) return;
    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head><body>
      <table border="1">
        <tr>
          <th style="background-color:#4f46e5;color:white;padding:5px;">Name</th>
          <th style="background-color:#4f46e5;color:white;padding:5px;">Email</th>
          <th style="background-color:#4f46e5;color:white;padding:5px;">Role</th>
          <th style="background-color:#4f46e5;color:white;padding:5px;">Match Score</th>
          <th style="background-color:#4f46e5;color:white;padding:5px;">Experience</th>
          <th style="background-color:#4f46e5;color:white;padding:5px;">Education</th>
          <th style="background-color:#4f46e5;color:white;padding:5px;">Matched Skills</th>
          <th style="background-color:#4f46e5;color:white;padding:5px;">Missing Skills</th>
        </tr>
        ${shortlisted.map(c => `
        <tr>
          <td>${c.name}</td>
          <td>${c.email}</td>
          <td>${c.role}</td>
          <td>${c.score}%</td>
          <td>${c.experience} Years</td>
          <td>${c.education}</td>
          <td>${c.skills.join(', ')}</td>
          <td>${c.missing}</td>
        </tr>`).join('')}
      </table>
      </body></html>
    `;
    const uri = 'data:application/vnd.ms-excel;base64,' + btoa(unescape(encodeURIComponent(tableHtml)));
    const link = document.createElement("a");
    link.setAttribute("href", uri);
    link.setAttribute("download", "shortlisted_candidates.xls");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto animate-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shortlisted Candidates</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Candidates automatically filtered with Match Score >= 85%.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={exportCSV} disabled={shortlisted.length === 0} className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium shadow-sm transition-all disabled:opacity-50">
            <Download className="w-4 h-4 mr-2 text-gray-500"/> CSV
          </button>
          <button onClick={exportExcel} disabled={shortlisted.length === 0} className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium shadow-sm transition-all disabled:opacity-50">
            <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600"/> Excel
          </button>
          <button 
            onClick={handleSendMail}
            disabled={mailSent || shortlisted.length === 0}
            className={`flex items-center px-6 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all ${mailSent ? 'bg-green-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50'}`}
          >
            {mailSent ? <><CheckCircle2 className="w-4 h-4 mr-2"/> Emails Sent!</> : <><Mail className="w-4 h-4 mr-2"/> Send Mail to All</>}
          </button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {shortlisted.length === 0 ? (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400 text-sm">No shortlisted candidates yet. Run matches in the dashboard.</div>
          ) : (
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-5 py-4 font-medium">Candidate Profile</th>
                  <th className="px-5 py-4 font-medium">Target Role</th>
                  <th className="px-5 py-4 font-medium">Match Score</th>
                  <th className="px-5 py-4 font-medium">Experience</th>
                </tr>
              </thead>
              <tbody>
                {shortlisted.map((c, idx) => (
                  <tr key={c.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.email}</p>
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-700 dark:text-gray-300">{c.role}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        {c.score}% Match
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{c.experience} Years</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
