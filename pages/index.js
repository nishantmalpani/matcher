import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useState } from 'react';

export default function Home() {
  const [people, setPeople] = useState([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [isRankingPhase, setIsRankingPhase] = useState(false);
  const [currentRanker, setCurrentRanker] = useState(0); // Index of current person ranking
  const [rankings, setRankings] = useState({}); // Store all rankings
  const [draggedPerson, setDraggedPerson] = useState(null);

  const handleAddPerson = (e) => {
    e.preventDefault();
    if (newPersonName.trim()) {
      setPeople([...people, { id: Date.now(), name: newPersonName }]);
      setNewPersonName('');
    }
  };

  const handleStartRanking = () => {
    if (people.length >= 2) {
      setIsRankingPhase(true);
      // Initialize rankings structure
      const initialRankings = {};
      people.forEach(person => {
        initialRankings[person.id] = [];
      });
      setRankings(initialRankings);
    }
  };

  const handleDragStart = (person) => {
    setDraggedPerson(person);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (index) => {
    if (!draggedPerson) return;

    const currentPersonId = people[currentRanker].id;
    const newRankings = { ...rankings };
    
    // Remove person if already ranked
    newRankings[currentPersonId] = newRankings[currentPersonId].filter(
      p => p.id !== draggedPerson.id
    );
    
    // Insert at new position
    newRankings[currentPersonId].splice(index, 0, draggedPerson);
    setRankings(newRankings);
    setDraggedPerson(null);
  };

  const handleNextPerson = () => {
    if (currentRanker < people.length - 1) {
      setCurrentRanker(prev => prev + 1);
    } else {
      // All rankings complete
      alert('All rankings completed!');
      // Here you would typically proceed to matching logic
    }
  };

  const isCurrentRankingComplete = () => {
    const currentPersonId = people[currentRanker].id;
    const currentRankings = rankings[currentPersonId] || [];
    return currentRankings.length === people.length - 1; // All except self
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Roommate Matcher</title>
        <meta name="description" content="Find your perfect roommate match" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Roommate Matcher</h1>

        {!isRankingPhase ? (
          <div className={styles.addPeopleSection}>
            <h2>Add People</h2>
            <form onSubmit={handleAddPerson}>
              <input
                type="text"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                placeholder="Enter name"
              />
              <button type="submit">Add Person</button>
            </form>

            <div className={styles.peopleList}>
              <h3>Added People:</h3>
              {people.map(person => (
                <div key={person.id} className={styles.personItem}>
                  {person.name}
                </div>
              ))}
            </div>

            {people.length >= 2 && (
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
              {people[currentRanker]?.name}, drag and rank your preferred roommates
              (most preferred at the top)
            </p>

            <div className={styles.rankingArea}>
              <div className={styles.unrankedPeople}>
                <h3>Available to Rank:</h3>
                {people
                  .filter(person => 
                    person.id !== people[currentRanker].id && 
                    !rankings[people[currentRanker].id]?.find(p => p.id === person.id)
                  )
                  .map(person => (
                    <div
                      key={person.id}
                      className={styles.draggablePerson}
                      draggable
                      onDragStart={() => handleDragStart(person)}
                    >
                      {person.name}
                    </div>
                  ))}
              </div>

              <div className={styles.rankingList}>
                <h3>Your Rankings:</h3>
                {Array.from({ length: people.length - 1 }, (_, index) => (
                  <div
                    key={index}
                    className={styles.rankingSlot}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                  >
                    {rankings[people[currentRanker].id]?.[index]?.name || 
                      `Drop here for rank ${index + 1}`}
                  </div>
                ))}
              </div>
            </div>

            {isCurrentRankingComplete() && (
              <button 
                onClick={handleNextPerson}
                className={styles.nextButton}
              >
                {currentRanker < people.length - 1 
                  ? 'Next Person' 
                  : 'Complete Rankings'}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
