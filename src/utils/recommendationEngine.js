// src/utils/recommendationEngine.js

/**
 * Calculates a match score between two sets of skills.
 * Basic implementation: counts the number of overlapping skills.
 */
const calculateSkillMatchScore = (skillsA, skillsB) => {
  const setA = new Set(skillsA.map((s) => s.toLowerCase()));
  const setB = new Set(skillsB.map((s) => s.toLowerCase()));
  
  let matchCount = 0;
  for (let skill of setA) {
    if (setB.has(skill)) {
      matchCount++;
    }
  }
  return matchCount;
};

/**
 * Ranks jobs for a specific candidate.
 */
export const rankJobsForCandidate = (candidate, jobs) => {
  return [...jobs].sort((a, b) => {
    const scoreA = calculateSkillMatchScore(candidate.skills, a.skillsReq);
    const scoreB = calculateSkillMatchScore(candidate.skills, b.skillsReq);
    return scoreB - scoreA; // descending order
  });
};

/**
 * Ranks candidates for a specific job.
 */
export const rankCandidatesForJob = (job, candidates) => {
  return [...candidates].sort((a, b) => {
    const scoreA = calculateSkillMatchScore(job.skillsReq, a.skills);
    const scoreB = calculateSkillMatchScore(job.skillsReq, b.skills);
    return scoreB - scoreA; // descending order
  });
};
