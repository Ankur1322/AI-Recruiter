import React, { createContext, useState, useContext } from 'react';

const CandidateContext = createContext();

export const useCandidates = () => useContext(CandidateContext);

export const CandidateProvider = ({ children }) => {
  const [candidates, setCandidates] = useState([
    { id: 101, name: "Alice Johnson", email: "alice.j@email.com", score: 94, status: "Highly Recommended", experience: 4, education: "Master", skills: ['Python', 'PyTorch', 'NLP', 'AWS'], missing: "None", matchedCount: 4, unmatchedCount: 0, role: 'AI Engineer' },
    { id: 102, name: "Bob Smith", email: "bsmith99@email.com", score: 82, status: "Recommended", experience: 2, education: "Bachelor", skills: ['Python', 'Scikit-learn'], missing: "PyTorch, Deep Learning", matchedCount: 2, unmatchedCount: 2, role: 'AI Engineer' }
  ]);

  const addCandidates = (newCandidates) => {
    setCandidates(prev => [...prev, ...newCandidates]);
  };

  const getShortlisted = () => {
    return candidates.filter(c => c.score >= 85);
  };

  return (
    <CandidateContext.Provider value={{ candidates, addCandidates, getShortlisted }}>
      {children}
    </CandidateContext.Provider>
  );
};
