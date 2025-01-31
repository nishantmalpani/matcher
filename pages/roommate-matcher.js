import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useState } from 'react';
import Link from 'next/link';
import { RoommateMatcher } from '../utils/roommateMatcher';

export default function RoommateMatcherPage() {
    const [people, setPeople] = useState([]);
    const [newName, setNewName] = useState('');
    const [isRankingPhase, setIsRankingPhase] = useState(false);
    const [currentRanker, setCurrentRanker] = useState({ index: 0 });
    const [rankings, setRankings] = useState({});
    const [draggedItem, setDraggedItem] = useState(null);
    const [matches, setMatches] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const matcher = new RoommateMatcher();

    const handleAdd = (e) => {
        e.preventDefault();
        if (newName.trim()) {
            const newPerson = { id: Date.now(), name: newName.trim() };
            setPeople([...people, newPerson]);
            setNewName('');
        }
    };

    const handleStartRanking = () => {
        if (people.length % 2 !== 0) {
            alert('Please add another person. We need an even number of people for matching.');
            return;
        }
        setIsRankingPhase(true);
        // Initialize empty rankings for all people
        const initialRankings = {};
        people.forEach(person => {
            initialRankings[person.id] = [];
        });
        setRankings(initialRankings);
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
        const currentId = people[currentRanker.index].id;
        
        // Remove if already ranked
        newRankings[currentId] = newRankings[currentId]
            .filter(item => item.id !== draggedItem.id);
        
        // Add at new position
        newRankings[currentId].splice(index, 0, draggedItem);
        setRankings(newRankings);
        setDraggedItem(null);
    };

    const handleNext = () => {
        if (currentRanker.index < people.length - 1) {
            setCurrentRanker({ index: currentRanker.index + 1 });
        } else {
            handleCompleteRankings();
        }
    };

    const handleCompleteRankings = () => {
        // Convert rankings to format needed for matcher
        Object.entries(rankings).forEach(([personId, rankedPeople]) => {
            const rankingsMap = {};
            rankedPeople.forEach((ranked, index) => {
                rankingsMap[ranked.name] = index + 1;
            });
            matcher.addPreference(
                people.find(p => p.id.toString() === personId).name,
                rankingsMap
            );
        });

        // Verify all rankings are complete
        const allRankingsComplete = Object.values(rankings).every(
            personRankings => personRankings.length === people.length - 1
        );

        if (!allRankingsComplete) {
            alert('Please ensure all rankings are complete before proceeding.');
            return;
        }

        try {
            matcher.createPreferenceGraph();
            const matchResults = matcher.findOptimalMatches();
            setMatches(matchResults);
            setShowResults(true);
        } catch (error) {
            console.error('Matching error:', error);
            alert('An error occurred while computing matches. Please try again.');
        }
    };

    const handleStartOver = () => {
        setPeople([]);
        setNewName('');
        setIsRankingPhase(false);
        setCurrentRanker({ index: 0 });
        setRankings({});
        setMatches(null);
        setShowResults(false);
    };

    const isCurrentRankingComplete = () => {
        const currentId = people[currentRanker.index].id;
        const currentRankings = rankings[currentId] || [];
        return currentRankings.length === people.length - 1;
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Roommate Matcher</title>
                <meta name="description" content="Match roommates based on mutual preferences" />
            </Head>

            <main className={styles.main}>
                <Link href="/" className={styles.backLink}>← Back to Home</Link>
                <h1 className={styles.title}>Roommate Matcher</h1>

                {showResults ? (
                    <div className={styles.resultsSection}>
                        <h2>Matching Results</h2>
                        <div className={styles.matchesGrid}>
                            {matches.map(([p1, p2], index) => (
                                <div key={index} className={styles.matchCard}>
                                    <div className={styles.matchPair}>
                                        <div className={styles.candidate}>
                                            <span className={styles.label}>Roommate 1:</span>
                                            <span className={styles.name}>{p1}</span>
                                        </div>
                                        <div className={styles.matchArrow}>↔️</div>
                                        <div className={styles.company}>
                                            <span className={styles.label}>Roommate 2:</span>
                                            <span className={styles.name}>{p2}</span>
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
                ) : !isRankingPhase ? (
                    <div className={styles.addSection}>
                        <form onSubmit={handleAdd}>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Enter person's name"
                                className={styles.input}
                            />
                            <button type="submit" className={styles.button}>Add Person</button>
                        </form>

                        <div className={styles.list}>
                            <h3>People Added ({people.length})</h3>
                            {people.map(person => (
                                <div key={person.id} className={styles.listItem}>
                                    {person.name}
                                </div>
                            ))}
                        </div>

                        {people.length >= 2 && (
                            <button 
                                onClick={handleStartRanking}
                                className={styles.startButton}
                                disabled={people.length % 2 !== 0}
                            >
                                Start Ranking Phase
                            </button>
                        )}
                    </div>
                ) : (
                    <div className={styles.rankingSection}>
                        <h2>Ranking Phase</h2>
                        <p className={styles.rankingInstruction}>
                            {people[currentRanker.index]?.name}, rank your preferred roommates
                        </p>

                        <div className={styles.rankingArea}>
                            <div className={styles.unrankedPeople}>
                                <h3>Available to Rank:</h3>
                                {people
                                    .filter(person => 
                                        person.id !== people[currentRanker.index].id &&
                                        !rankings[people[currentRanker.index].id]?.find(
                                            r => r.id === person.id
                                        )
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
                                    ))
                                }
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
                                        {rankings[people[currentRanker.index].id]?.[index]?.name
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
                                {currentRanker.index < people.length - 1
                                    ? 'Next Person'
                                    : 'Show Matches'}
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
} 