import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

interface Player {
    id: string;
    email: string;
    displayName: string;
    score: number;
    rank?: number;
}

export const updateRank = functions.region('europe-west2').firestore
    .document('highscores/{documentId}')
    .onWrite(async (_change, _context) => {
        const batch = admin.firestore().batch();
        const playersSnapshot = await admin.firestore().collection('highscores').get();

        let players: Player[] = [];
        playersSnapshot.forEach(doc => {
            players.push({ id: doc.id, ...doc.data() } as Player);
        });

        players.sort((a, b) => b.score - a.score);

        for(let i = 0; i < players.length; i++) {
            let player = players[i];
            let rank = i + 1;  // rank is index + 1
            let playerDocRef = admin.firestore().collection('highscores').doc(player.id);
            batch.update(playerDocRef, { rank: rank });
        }

        return batch.commit()
            .then(() => console.log('Successfully updated ranks'))
            .catch(error => console.error('Failed to update ranks:', error));
    });
