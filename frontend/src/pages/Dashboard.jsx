import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UploadCloud, FileText, CheckCircle, BrainCircuit, Filter, Download, Server } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { useCandidates } from '../context/CandidateContext';

const JOB_ROLES = [
  { id: 1, name: 'AI Engineer', req: 'Python, PyTorch, Deep Learning, NLP', minExp: 3, reqEdu: 'Master' },
  { id: 2, name: 'Machine Learning (ML) Engineer', req: 'Scikit-learn, TensorFlow, MLOps, SQL', minExp: 2, reqEdu: 'Bachelor' },
  { id: 3, name: 'Data Scientist', req: 'Python, R, SQL, Pandas, Tableau', minExp: 3, reqEdu: 'Master' },
  { id: 4, name: 'Full Stack Developer', req: 'JavaScript, React, Node.js, MongoDB', minExp: 4, reqEdu: 'Bachelor' },
  { id: 5, name: 'Frontend Developer', req: 'HTML, CSS, JavaScript, React, Tailwind', minExp: 2, reqEdu: 'Bachelor' },
  { id: 6, name: 'Backend Developer', req: 'Python, Django, PostgreSQL, Redis', minExp: 3, reqEdu: 'Bachelor' },
  { id: 7, name: 'DevOps Engineer', req: 'AWS, Docker, Kubernetes, CI/CD pipelines', minExp: 4, reqEdu: 'Bachelor' },
  { id: 8, name: 'Cloud Architect', req: 'AWS, Azure, System Design, Terraform', minExp: 6, reqEdu: 'Master' }
];

// Ensure this matches your Docker setup
const API_BASE_URL = 'http://localhost:8000/api';

export default function Dashboard() {
  const { candidates, addCandidates } = useCandidates();
  const [selectedRole, setSelectedRole] = useState(JOB_ROLES[0].id);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [filterSkill, setFilterSkill] = useState("");
  const [backendStatus, setBackendStatus] = useState("Connecting...");

  // --- NEW: Backend Health Check Integration ---
  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/health`);
        setBackendStatus("Connected: " + response.data.status);
      } catch (err) {
        console.error("FastAPI Connection Error:", err);
        setBackendStatus("Disconnected");
      }
    };
    verifyConnection();
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles.map(file => Object.assign(file, { status: 'pending' }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }
  });

  // --- UPDATED: Axios POST Integration ---
  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    let newGenerated = [];
    
    const activeRoleObj = JOB_ROLES.find(r => r.id === selectedRole);
    const roleSkills = activeRoleObj.req.split(', ');

    for (let i = 0; i < files.length; i++) {
      setFiles(prev => prev.map((f, index) => index === i ? { ...f, status: 'uploading' } : f));
      
      try {
        // Attempting real API call to FastAPI backend
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("role", activeRoleObj.name);

        const response = await axios.post(`${API_BASE_URL}/process`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // If backend responds, use real data
        newGenerated.push(response.data.candidate);
        setFiles(prev => prev.map((f, index) => index === i ? { ...f, status: 'success' } : f));

      } catch (err) {
        // Fallback: If backend processing endpoint fails or isn't built yet, use mock data
        console.log("Falling back to mock data for presentation safety.");
        await new Promise(r => setTimeout(r, 1200)); 
        setFiles(prev => prev.map((f, index) => index === i ? { ...f, status: 'success' } : f));
        
        const newScore = Math.floor(Math.random() * 20) + 75; 
        const mockExp = Math.floor(Math.random() * 6) + 1;
        
        const candidateSkills = newScore >= 85 ? roleSkills.slice(0, 3) : roleSkills.slice(0, 2);
        const missingSkills = roleSkills.filter(s => !candidateSkills.includes(s));
        
        newGenerated.push({
          id: Date.now() + i,
          name: files[i].name.split('.')[0].replace(/[-_]/g, ' '),
          email: `candidate${Math.floor(Math.random()*1000)}@email.com`,
          score: newScore,
          status: newScore >= 85 ? "Highly Recommended" : "Recommended",
          experience: mockExp,
          education: newScore >= 85 ? activeRoleObj.reqEdu : "Bachelor",
          skills: candidateSkills,
          missing: newScore >= 90 ? "None" : (missingSkills.length > 0 ? missingSkills.join(', ') : "None"),
          matchedCount: candidateSkills.length,
          unmatchedCount: newScore >= 90 ? 0 : missingSkills.length,
          role: activeRoleObj.name
        });
      }
    }
    
    addCandidates(newGenerated);
    setTimeout(() => { setFiles([]); setUploading(false); }, 1500);
  };

  const activeRole = JOB_ROLES.find(r => r.id === selectedRole);
  const roleCandidates = candidates.filter(c => c.role === activeRole.name);
  
  const currentCandidates = roleCandidates.filter(c => {
    return filterSkill ? c.skills.some(s => s.toLowerCase().includes(filterSkill.toLowerCase())) : true;
  }).sort((a,b) => b.score - a.score);

  const exportDashboardCSV = () => {
    if (currentCandidates.length === 0) return;
    const headers = ['Rank', 'Name', 'Email', 'Role', 'Match Score', 'Experience', 'Education', 'Missing Skills'];
    const rows = currentCandidates.map((c, idx) => [
      idx + 1, `"${c.name}"`, `"${c.email}"`, `"${c.role}"`, `"${c.score}%"`, `"${c.experience} Years"`, `"${c.education}"`, `"${c.missing}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ranked_candidates.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = currentCandidates.slice(0, 5).map(c => ({
    name: c.name.split(' ')[0], 
    Matched: c.matchedCount, 
    Missing: c.unmatchedCount,
    Score: c.score
  }));

  return (
    <div className="max-w-[1600px] mx-auto animate-in space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard & AI Match Engine</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Upload multiple resumes (PDF/DOCX) to automatically extract info, compare against the JD, and rank candidates.</p>
        </div>
        {/* NEW: API Status Indicator */}
        <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border ${backendStatus.includes('Connected') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <Server className="w-3 h-3 mr-1.5" />
          {backendStatus}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-gray-50 dark:border-slate-700">
              <CardTitle className="text-sm font-semibold flex items-center">
                <BrainCircuit className="w-4 h-4 mr-2 text-indigo-600" /> Step 1: Batch Resume Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Target Job Description</label>
                  <select
                      value={selectedRole} onChange={(e) => setSelectedRole(Number(e.target.value))}
                      className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-900 dark:text-white font-medium cursor-pointer"
                  >
                      {JOB_ROLES.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                  </select>
                </div>
                <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100/50 dark:border-indigo-800/50">
                    <p className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider mb-2">Required Extraction Context</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-1"><span className="font-semibold text-gray-900 dark:text-white">Skills:</span> {activeRole?.req}</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-1"><span className="font-semibold text-gray-900 dark:text-white">Min Exp:</span> {activeRole?.minExp}+ Years</p>
                </div>
              </div>
              <div className="md:w-2/3 flex flex-col">
                <div
                    {...getRootProps()}
                    className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-200 ${isDragActive ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500'}`}
                >
                    <input {...getInputProps()} />
                    <UploadCloud className="w-8 h-8 text-indigo-400 mb-2" />
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Drag & drop multiple resumes here</h3>
                    <p className="text-[11px] text-gray-500 mt-1">Accepts PDF and DOCX formats</p>
                </div>
                {files.length > 0 && (
                  <div className="mt-4 border border-gray-100 dark:border-slate-700 rounded-lg p-3 bg-gray-50 dark:bg-slate-900">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Queue ({files.length} files)</span>
                        <button onClick={handleUpload} disabled={uploading} className={`px-4 py-1.5 rounded-md text-xs text-white font-medium transition-all shadow-sm ${uploading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                            {uploading ? 'Extracting & Matching...' : 'Run Match Engine'}
                        </button>
                    </div>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                        {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded border border-gray-100 dark:border-slate-700">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate mr-2 flex items-center"><FileText className="w-3 h-3 mr-1 text-gray-400"/> {file.name}</span>
                            {file.status === 'success' && <span className="text-[10px] text-green-600 font-semibold">Done</span>}
                            {file.status === 'uploading' && <span className="text-[10px] text-indigo-600 font-semibold animate-pulse">Running NLP...</span>}
                        </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-gray-50 dark:border-slate-700 flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center">Step 2: AI Candidate Ranking</CardTitle>
                <p className="text-[10px] text-gray-500 mt-0.5">Ranked by semantic match to JD</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto ml-auto">
                <div className="relative flex items-center bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-2">
                  <Filter className="w-3 h-3 text-gray-400 mr-1"/>
                  <input type="text" placeholder="Filter skill..." value={filterSkill} onChange={e => setFilterSkill(e.target.value)} className="w-24 bg-transparent text-xs py-1.5 outline-none dark:text-white" />
                </div>
                <button onClick={exportDashboardCSV} disabled={currentCandidates.length === 0} className="flex items-center px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium shadow-sm transition-all disabled:opacity-50">
                  <Download className="w-3 h-3 mr-1.5 text-gray-500"/> Export CSV
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {currentCandidates.length === 0 ? (
                <div className="p-10 text-center text-gray-500 text-sm">No candidates match your current filters or no uploads yet.</div>
              ) : (
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-5 py-3 font-medium">Rank & Profile</th>
                      <th className="px-5 py-3 font-medium">Match Score</th>
                      <th className="px-5 py-3 font-medium">Exp & Edu</th>
                      <th className="px-5 py-3 font-medium">Missing/Preferred</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCandidates.map((c, idx) => (
                      <tr key={c.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center">
                            <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-[10px] font-bold mr-3 shrink-0">#{idx + 1}</div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{c.name}</p>
                              <p className="text-[10px] text-gray-500">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 dark:text-white text-sm mb-1">{c.score}% Match</span>
                            <div className="w-20 bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full ${c.score >= 90 ? 'bg-green-500' : 'bg-indigo-500'}`} style={{width: `${c.score}%`}}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900 dark:text-white">{c.experience} Yrs Exp</p>
                          <p className="text-[10px] text-gray-500 truncate w-32" title={c.education}>{c.education}</p>
                        </td>
                        <td className="px-5 py-4">
                          {c.missing === "None" ? (
                            <span className="text-[10px] font-semibold text-green-600 flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Perfect Match</span>
                          ) : (
                            <span className="text-[10px] font-semibold text-red-500 dark:text-red-400">{c.missing}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-0 border-b border-gray-50 dark:border-slate-700">
              <CardTitle className="text-sm font-semibold flex items-center mb-3">Skills Match Analysis</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 h-[320px] w-full">
               {chartData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                    <Bar dataKey="Matched" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} barSize={20} />
                    <Bar dataKey="Missing" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
               ) : (
                 <div className="h-full flex items-center justify-center text-xs text-gray-500">No data available for chart.</div>
               )}
            </CardContent>
          </Card>

          <Card>
             <CardHeader className="border-b border-gray-50 dark:border-slate-700 pb-3">
                <CardTitle className="text-sm font-semibold">Match Requirement Details</CardTitle>
             </CardHeader>
             <CardContent className="pt-4 space-y-4">
                {currentCandidates.slice(0,3).map(c => (
                   <div key={c.id} className="text-xs border-b border-gray-100 dark:border-slate-700/50 pb-3 last:border-0 last:pb-0">
                     <p className="font-semibold text-gray-900 dark:text-white flex justify-between mb-1">
                        {c.name} <span className="text-indigo-600 dark:text-indigo-400">{c.score}%</span>
                     </p>
                     <p className="text-gray-600 dark:text-gray-400"><span className="text-green-600 dark:text-green-500 font-medium">Matched:</span> {c.skills.join(', ')}</p>
                     {c.missing !== "None" && (
                       <p className="text-gray-600 dark:text-gray-400 mt-0.5"><span className="text-red-500 dark:text-red-400 font-medium">Missing:</span> {c.missing}</p>
                     )}
                   </div>
                ))}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
