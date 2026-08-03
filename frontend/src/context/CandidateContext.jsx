import React, { createContext, useState, useContext } from 'react';

const CandidateContext = createContext();

export const useCandidates = () => useContext(CandidateContext);

export const CandidateProvider = ({ children }) => {
  const [candidates, setCandidates] = useState([]);

  const addCandidates = (newCandidates) => {
    setCandidates(prev => [...prev, ...newCandidates]);
  };

  const getShortlisted = () => {
    return candidates.filter(c => c && typeof c.score === 'number' && c.score >= 85);
  };

  return (
    <CandidateContext.Provider value={{ candidates, addCandidates, getShortlisted }}>
      {children}
    </CandidateContext.Provider>
  );
};
