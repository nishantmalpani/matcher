class Person {
  constructor(name, jobRankings) {
    this.name = name;
    this.jobRankings = jobRankings; // Array of Job objects
    this.topOffer = null;
  }
}

class Job {
  constructor(name) {
    this.name = name;
    this.offerMade = false;
    this.candidateRankings = []; // Array of Person objects
    this.index = 0;
  }
}

function jobOptimalStableMatching(jobs, candidates) {
  if (jobs.length !== candidates.length) {
    throw new Error("Number of jobs and candidates must be equal");
  }

  // Helper function to find rank of job in candidate's preferences
  function getRank(candidate, job) {
    return candidate.jobRankings.findIndex(j => j === job);
  }

  let someJobUnmatched = true;
  
  while (someJobUnmatched) {
    someJobUnmatched = false;
    
    for (const job of jobs) {
      if (!job.offerMade && job.index < job.candidateRankings.length) {
        someJobUnmatched = true;
        const candidate = job.candidateRankings[job.index];
        
        if (candidate.topOffer === null) {
          // Candidate has no offer, accept this one
          candidate.topOffer = job;
          job.offerMade = true;
        } else {
          // Compare ranks of current offer vs new offer
          const currentRank = getRank(candidate, candidate.topOffer);
          const newRank = getRank(candidate, job);
          
          if (newRank < currentRank) { // Lower rank is better
            // Candidate prefers new job
            const oldJob = candidate.topOffer;
            oldJob.offerMade = false;
            oldJob.index += 1;
            candidate.topOffer = job;
            job.offerMade = true;
          } else {
            // Candidate rejects new job
            job.index += 1;
          }
        }
      }
    }
  }

  // Check if all jobs and candidates are matched
  const allMatched = jobs.every(job => job.offerMade) && 
                    candidates.every(candidate => candidate.topOffer !== null);
  
  if (!allMatched) {
    throw new Error("Not all participants could be matched");
  }

  return candidates.map(candidate => ({
    candidate: candidate.name,
    job: candidate.topOffer.name
  }));
}

// Helper function to create Person and Job objects from raw data
function createMatchingEntities(jobSeekerData, companyData) {
  // Create Job objects
  const jobs = companyData.map(company => new Job(company.name));
  
  // Create Person objects
  const candidates = jobSeekerData.map(seeker => {
    // Convert rankings from IDs to Job objects
    const jobRankings = seeker.rankings.map(rankingId => 
      jobs.find(job => job.name === rankingId)
    );
    return new Person(seeker.name, jobRankings);
  });

  // Set candidate rankings for each job
  jobs.forEach((job, jobIndex) => {
    job.candidateRankings = companyData[jobIndex].rankings.map(rankingId =>
      candidates.find(candidate => candidate.name === rankingId)
    );
  });

  return { jobs, candidates };
}

// Example usage:
function executeMatching(jobSeekerData, companyData) {
  try {
    const { jobs, candidates } = createMatchingEntities(jobSeekerData, companyData);
    const matches = jobOptimalStableMatching(jobs, candidates);
    return matches;
  } catch (error) {
    console.error("Matching error:", error);
    return null;
  }
}

// Export the functions
export { executeMatching }; 