export class RoommateMatcher {
    constructor() {
        this.graph = new Map();
        this.preferences = new Map();
    }

    addPreference(person, rankings) {
        this.preferences.set(person, rankings);
    }

    createPreferenceGraph() {
        this.graph.clear();
        const people = Array.from(this.preferences.keys());
        
        people.forEach(person => {
            this.graph.set(person, new Map());
        });

        for (let i = 0; i < people.length; i++) {
            for (let j = i + 1; j < people.length; j++) {
                const person1 = people[i];
                const person2 = people[j];

                const rankings1 = this.preferences.get(person1);
                const rankings2 = this.preferences.get(person2);

                const maxRank = people.length - 1;
                const score1 = maxRank - rankings1[person2] + 1;
                const score2 = maxRank - rankings2[person1] + 1;
                
                const weight = score1 + score2;
                
                this.graph.get(person1).set(person2, weight);
                this.graph.get(person2).set(person1, weight);
            }
        }
    }

    findOptimalMatches() {
        const matches = new Set();
        const matched = new Set();
        
        while (true) {
            let maxWeight = -1;
            let bestPair = null;

            for (const [person1, edges] of this.graph) {
                if (matched.has(person1)) continue;
                
                for (const [person2, weight] of edges) {
                    if (matched.has(person2)) continue;
                    
                    if (weight > maxWeight) {
                        maxWeight = weight;
                        bestPair = [person1, person2];
                    }
                }
            }

            if (!bestPair) break;

            matches.add(bestPair);
            matched.add(bestPair[0]);
            matched.add(bestPair[1]);
        }

        return Array.from(matches);
    }
} 