import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useState } from 'react';
import Link from 'next/link';
import { executeMatching } from '../utils/stableMatching';

export default function JobMatcher() {
  const [jobSeekers, setJobSeekers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [newName, setNewName] = useState('');
  const [isAddingJobSeeker, setIsAddingJobSeeker] = useState(true);
  const [isRankingPhase, setIsRankingPhase] = useState(false);
  const [currentRanker, setCurrentRanker] = useState({ type: 'jobSeeker', index: 0 });
  const [rankings, setRankings] = useState({ jobSeekers: {}, companies: {} });
  const [draggedItem, setDraggedItem] = useState(null);
  const [matches, setMatches] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (newName.trim()) {
      const newItem = { id: Date.now(), name: newName };
      if (isAddingJobSeeker) {
        setJobSeekers([...jobSeekers, newItem]);
      } else {
        setCompanies([...companies, newItem]);
      }
      setNewName('');
    }
  };

  const handleStartRanking = () => {
    if (jobSeekers.length >= 1 && companies.length >= 1) {
      setIsRankingPhase(true);
      // Initialize empty rankings for all job seekers and companies
      const initialRankings = {
        jobSeekers: {},
        companies: {}
      };
      jobSeekers.forEach(seeker => {
        initialRankings.jobSeekers[seeker.id] = [];
      });
      companies.forEach(company => {
        initialRankings.companies[company.id] = [];
      });
      setRankings(initialRankings);
    }
  };

  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (index) => {
    if (!draggedItem) return;

    const newRankings = { ...rankings };
    const currentId = currentRanker.type === 'jobSeeker' 
      ? jobSeekers[currentRanker.index].id 
      : companies[currentRanker.index].id;
    
    const rankingsKey = currentRanker.type === 'jobSeeker' ? 'jobSeekers' : 'companies';
    
    // Remove if already ranked
    newRankings[rankingsKey][currentId] = newRankings[rankingsKey][currentId]
      .filter(item => item.id !== draggedItem.id);
    
    // Add at new position
    newRankings[rankingsKey][currentId].splice(index, 0, draggedItem);
    setRankings(newRankings);
    setDraggedItem(null);
  };

  const handleNext = () => {
    if (currentRanker.type === 'jobSeeker') {
      if (currentRanker.index < jobSeekers.length - 1) {
        setCurrentRanker({ type: 'jobSeeker', index: currentRanker.index + 1 });
      } else {
        setCurrentRanker({ type: 'company', index: 0 });
      }
    } else if (currentRanker.index < companies.length - 1) {
      setCurrentRanker({ type: 'company', index: currentRanker.index + 1 });
    } else {
      handleCompleteRankings();
    }
  };

  const handleCompleteRankings = () => {
    // Format the data for the matching algorithm
    const jobSeekerData = jobSeekers.map(seeker => ({
      name: seeker.name,
      // Ensure we map to names and handle potential undefined rankings
      rankings: (rankings.jobSeekers[seeker.id] || []).map(r => r.name)
    }));

    const companyData = companies.map(company => ({
      name: company.name,
      // Ensure we map to names and handle potential undefined rankings
      rankings: (rankings.companies[company.id] || []).map(r => r.name)
    }));

    // Verify all rankings are complete before executing matching
    const allRankingsComplete = jobSeekerData.every(seeker => 
      seeker.rankings.length === companies.length
    ) && companyData.every(company => 
      company.rankings.length === jobSeekers.length
    );

    if (!allRankingsComplete) {
      alert('Please ensure all rankings are complete before proceeding.');
      return;
    }

    try {
      const matchResults = executeMatching(jobSeekerData, companyData);
      if (matchResults) {
        setMatches(matchResults);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Matching error:', error);
      alert('An error occurred while computing matches. Please try again.');
    }
  };

  const handleStartOver = () => {
    setJobSeekers([]);
    setCompanies([]);
    setNewName('');
    setIsAddingJobSeeker(true);
    setIsRankingPhase(false);
    setCurrentRanker({ type: 'jobSeeker', index: 0 });
    setRankings({ jobSeekers: {}, companies: {} });
    setMatches(null);
    setShowResults(false);
  };

  const isCurrentRankingComplete = () => {
    const currentId = currentRanker.type === 'jobSeeker'
      ? jobSeekers[currentRanker.index].id
      : companies[currentRanker.index].id;
    
    const rankingsKey = currentRanker.type === 'jobSeeker' ? 'jobSeekers' : 'companies';
    const currentRankings = rankings[rankingsKey][currentId] || [];
    
    return currentRanker.type === 'jobSeeker' 
      ? currentRankings.length === companies.length
      : currentRankings.length === jobSeekers.length;
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Job Matcher</title>
        <meta name="description" content="Match job seekers with companies" />
      </Head>

      <main className={styles.main}>
        <Link href="/" className={styles.backLink}>← Back to Home</Link>
        <h1 className={styles.title}>Job Matcher</h1>

        {showResults ? (
          <div className={styles.resultsSection}>
            <h2>Matching Results</h2>
            <div className={styles.matchesGrid}>
              {matches.map((match, index) => (
                <div key={index} className={styles.matchCard}>
                  <div className={styles.matchPair}>
                    <div className={styles.candidate}>
                      <span className={styles.label}>Candidate:</span>
                      <span className={styles.name}>{match.candidate}</span>
                    </div>
                    <div className={styles.matchArrow}>↔️</div>
                    <div className={styles.company}>
                      <span className={styles.label}>Company:</span>
                      <span className={styles.name}>{match.job}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={handleStartOver}
              className={styles.startOverButton}
            >
              Start New Matching
            </button>
          </div>
        ) : (
          !isRankingPhase ? (
            <div className={styles.addSection}>
              <div className={styles.toggleButtons}>
                <button 
                  className={`${styles.toggleButton} ${isAddingJobSeeker ? styles.active : ''}`}
                  onClick={() => setIsAddingJobSeeker(true)}
                >
                  Add Job Seekers
                </button>
                <button 
                  className={`${styles.toggleButton} ${!isAddingJobSeeker ? styles.active : ''}`}
                  onClick={() => setIsAddingJobSeeker(false)}
                >
                  Add Companies
                </button>
              </div>

              <form onSubmit={handleAdd}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={`Enter ${isAddingJobSeeker ? 'job seeker' : 'company'} name`}
                />
                <button type="submit">Add</button>
              </form>

              <div className={styles.listsContainer}>
                <div className={styles.list}>
                  <h3>Job Seekers ({jobSeekers.length})</h3>
                  {jobSeekers.map(seeker => (
                    <div key={seeker.id} className={styles.listItem}>
                      {seeker.name}
                    </div>
                  ))}
                </div>

                <div className={styles.list}>
                  <h3>Companies ({companies.length})</h3>
                  {companies.map(company => (
                    <div key={company.id} className={styles.listItem}>
                      {company.name}
                    </div>
                  ))}
                </div>
              </div>

              {jobSeekers.length >= 1 && companies.length >= 1 && (
                <button 
                  onClick={handleStartRanking}
                  className={styles.startButton}
                >
                  Start Ranking Phase
                </button>
              )}
            </div>
          ) : (
            <div className={styles.rankingSection}>
              <h2>Ranking Phase</h2>
              <p className={styles.rankingInstruction}>
                {currentRanker.type === 'jobSeeker'
                  ? `${jobSeekers[currentRanker.index]?.name}, rank your preferred companies`
                  : `${companies[currentRanker.index]?.name}, rank your preferred candidates`}
              </p>

              <div className={styles.rankingArea}>
                <div className={styles.unrankedPeople}>
                  <h3>Available to Rank:</h3>
                  {currentRanker.type === 'jobSeeker' ? (
                    companies
                      .filter(company => 
                        !rankings.jobSeekers[jobSeekers[currentRanker.index].id]?.find(
                          r => r.id === company.id
                        )
                      )
                      .map(company => (
                        <div
                          key={company.id}
                          className={styles.draggablePerson}
                          draggable
                          onDragStart={() => handleDragStart(company)}
                        >
                          {company.name}
                        </div>
                      ))
                  ) : (
                    jobSeekers
                      .filter(seeker => 
                        !rankings.companies[companies[currentRanker.index].id]?.find(
                          r => r.id === seeker.id
                        )
                      )
                      .map(seeker => (
                        <div
                          key={seeker.id}
                          className={styles.draggablePerson}
                          draggable
                          onDragStart={() => handleDragStart(seeker)}
                        >
                          {seeker.name}
                        </div>
                      ))
                  )}
                </div>

                <div className={styles.rankingList}>
                  <h3>Your Rankings:</h3>
                  {Array.from({ 
                    length: currentRanker.type === 'jobSeeker' ? companies.length : jobSeekers.length 
                  }, (_, index) => (
                    <div
                      key={index}
                      className={styles.rankingSlot}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                    >
                      {currentRanker.type === 'jobSeeker'
                        ? rankings.jobSeekers[jobSeekers[currentRanker.index].id]?.[index]?.name
                        : rankings.companies[companies[currentRanker.index].id]?.[index]?.name
                        || `Drop here for rank ${index + 1}`}
                    </div>
                  ))}
                </div>
              </div>

              {isCurrentRankingComplete() && (
                <button 
                  onClick={handleNext}
                  className={styles.nextButton}
                >
                  {currentRanker.type === 'jobSeeker' && currentRanker.index < jobSeekers.length - 1
                    ? 'Next Job Seeker'
                    : currentRanker.type === 'company' && currentRanker.index < companies.length - 1
                    ? 'Next Company'
                    : currentRanker.type === 'jobSeeker'
                    ? 'Proceed to Company Rankings'
                    : 'Show Matches'}
                </button>
              )}
            </div>
          )
        )}

        {isRankingPhase && currentRanker.type === 'company' && 
         currentRanker.index === companies.length - 1 && 
         isCurrentRankingComplete() && (
          <button 
            onClick={handleCompleteRankings}
            className={styles.completeButton}
          >
            Show Matches
          </button>
        )}
      </main>
    </div>
  );
} 