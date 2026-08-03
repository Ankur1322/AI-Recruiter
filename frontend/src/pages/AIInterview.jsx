import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Bot, Loader2, PlayCircle } from 'lucide-react';
import { useCandidates } from '../context/CandidateContext';

export default function AIInterview() {
  const { getShortlisted } = useCandidates();
  const shortlisted = getShortlisted();
  
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);

  const handleGenerate = () => {
    if (!selectedCandidateId) return alert("Select a candidate first.");
    setGenerating(true);
    setQuestions([]);
    
    setTimeout(() => {
      const candidate = shortlisted.find(c => c.id == selectedCandidateId);
      const roleStr = candidate.role.toLowerCase();
      
      let techQ = "Describe your experience and preferred tools in your previous projects.";
      if (roleStr.includes('data') || roleStr.includes('ml') || roleStr.includes('ai')) {
           techQ = "Can you explain how you handle overfitting in machine learning models and handle large datasets?";
      } else if (roleStr.includes('frontend') || roleStr.includes('full stack')) {
           techQ = "What is your approach to state management in complex React applications?";
      } else if (roleStr.includes('backend') || roleStr.includes('devops') || roleStr.includes('cloud')) {
           techQ = "How do you design scalable architectures and pipelines to handle high-traffic spikes?";
      }
      
      const generatedQ = [
        { type: "Technical Baseline", text: techQ },
        { type: "Experience Deep-Dive", text: `Given your ${candidate.experience} years of experience in ${candidate.role} roles, describe the most challenging deployment issue you've faced and how you resolved it.` },
        { type: "Skill Specific", text: `I see you are proficient in ${candidate.skills[0] || 'your core stack'}. How do you optimize your code for large-scale processing?` },
        { type: "Scenario Based", text: "If you were given a project with changing requirements midway through development, what steps would you take to ensure delivery without sacrificing code quality?" }
      ];
      
      setQuestions(generatedQ);
      setGenerating(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Interview Generator</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Generate tailored technical and behavioral questions for shortlisted candidates based on their role and extracted experience.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
           <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Select Shortlisted Candidate</label>
                <select 
                  value={selectedCandidateId} 
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm dark:text-white outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Candidate --</option>
                  {shortlisted.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.role} ({c.experience} Yrs Exp)</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={handleGenerate}
                disabled={generating}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center justify-center min-w-[200px]"
              >
                {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Generating...</> : <><Bot className="w-4 h-4 mr-2"/> Generate Questions</>}
              </button>
           </div>
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center"><PlayCircle className="w-5 h-5 mr-2 text-indigo-500"/> AI Generated Interview Plan</h3>
          {questions.map((q, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1 block">{q.type}</span>
                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">{q.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
