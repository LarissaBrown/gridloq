const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Game = require('../models/game');
// const { validateAuthToken } = require('../middleware/auth'); // Comment this out for now
const { 
    generateTileValue, 
    makeMove, 
    isPlayersTurn,
    calculateScore,
    saveGameState 
} = require('../services/gameService');
const { gameRateLimiter, pollRateLimiter } = require('../middleware/rateLimiter');
const GameHistory = require('../models/gameHistory');

// Helper function to check for all possible sequences
const findAllSequences = (board, boardOwnership) => {
    const sequences = [];
    const directions = [
        [[0,1], [0,2], [0,3], [0,4], [0,5], [0,6]], // horizontal
        [[1,0], [2,0], [3,0], [4,0], [5,0], [6,0]], // vertical
        [[1,1], [2,2], [3,3], [4,4], [5,5], [6,6]], // diagonal right
        [[1,-1], [2,-2], [3,-3], [4,-4], [5,-5], [6,-6]] // diagonal left
    ];
    
    for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 7; col++) {
            if (!board[row][col]) continue;
            
            const currentOwner = boardOwnership[row][col];
            
            for (const direction of directions) {
                let sequence = [{
                    row,
                    col,
                    value: board[row][col]
                }];
                
                // Check each position in this direction
                for (const [dx, dy] of direction) {
                    const newRow = row + dx;
                    const newCol = col + dy;
                    
                    if (newRow < 0 || newRow >= 7 || newCol < 0 || newCol >= 7) break;
                    
                    if (board[newRow][newCol] && 
                        boardOwnership[newRow][newCol] === currentOwner) {
                        sequence.push({
                            row: newRow,
                            col: newCol,
                            value: board[newRow][newCol]
                        });
                    } else {
                        break;
                    }
                }
                
                // If sequence is 3 or more, add it
                if (sequence.length >= 3) {
                    sequences.push({
                        positions: sequence,
                        owner: currentOwner,
                        score: sequence.reduce((sum, pos) => sum + pos.value, 0)
                    });
                }
            }
        }
    }
    
    return sequences;
};

// Helper function to check potential sequences in a direction
const checkPotentialSequence = (board, row, col, owner, boardOwnership) => {
    const directions = [
        [[0,1], [0,2], [0,3]], // horizontal
        [[1,0], [2,0], [3,0]], // vertical
        [[1,1], [2,2], [3,3]], // diagonal right
        [[1,-1], [2,-2], [3,-3]] // diagonal left
    ];
    
    let maxSequenceValue = 0;
    
    for (const direction of directions) {
        let sequenceLength = 1;
        let sequenceValue = board[row][col] || 0;
        let validSequence = true;
        
        for (const [dx, dy] of direction) {
            const newRow = row + dx;
            const newCol = col + dy;
            
            if (newRow < 0 || newRow >= 7 || newCol < 0 || newCol >= 7) {
                validSequence = false;
                break;
            }
            
            if (board[newRow][newCol] && 
                (!boardOwnership[newRow][newCol] || boardOwnership[newRow][newCol] === owner)) {
                sequenceLength++;
                sequenceValue += board[newRow][newCol];
            } else if (!board[newRow][newCol]) {
                // Empty space - potential for sequence
                continue;
            } else {
                validSequence = false;
                break;
            }
        }
        
        if (validSequence && sequenceLength >= 2) {
            maxSequenceValue = Math.max(maxSequenceValue, sequenceValue);
        }
    }
    
    return maxSequenceValue;
};

const findBestMove = (board) => {
    // First move strategy - choose a random corner or center position
    const isEmpty = board.every(row => row.every(cell => cell === null));
    if (isEmpty) {
        const firstMoveOptions = [
            {row: 0, col: 0}, {row: 0, col: 6},
            {row: 3, col: 3},
            {row: 6, col: 0}, {row: 6, col: 6}
        ];
        return firstMoveOptions[Math.floor(Math.random() * firstMoveOptions.length)];
    }

    // Rest of the strategic logic...
    // ... existing code for finding best move ...
};

// In-memory game state
let gameState = {
    board: Array(7).fill(null).map(() => Array(7).fill(null)),
    boardOwnership: Array(7).fill(null).map(() => Array(7).fill(null)),
    currentPlayer: 'player2',
    scores: { player1: 0, player2: 0 },
    sequences: []
};

// Initialize new game
router.post('/new', (req, res) => {
    try {
        gameState = {
            board: Array(7).fill(null).map(() => Array(7).fill(null)),
            boardOwnership: Array(7).fill(null).map(() => Array(7).fill(null)),
            currentPlayer: 'player2',
            scores: { player1: 0, player2: 0 },
            sequences: []
        };
        
        res.json({ success: true, gameState });
        
        // Make computer's first move after a delay
        setTimeout(() => {
            const computerMove = findBestMove(gameState.board);
            if (computerMove) {
                const tileValue = Math.floor(Math.random() * 9) + 1;
                gameState.board[computerMove.row][computerMove.col] = tileValue;
                gameState.boardOwnership[computerMove.row][computerMove.col] = 'player2';
                gameState.currentPlayer = 'player1';
            }
        }, 1500);
    } catch (error) {
        console.error('Error creating new game:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get current game state
router.get('/state', (req, res) => {
    try {
        res.json({ success: true, gameState });
    } catch (error) {
        console.error('Error getting game state:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Make a move
router.post('/move', (req, res) => {
    try {
        const { row, col } = req.body;
        
        if (gameState.board[row][col] !== null) {
            return res.json({
                success: false,
                message: 'Position already taken'
            });
        }

        // Generate random tile value
        const tileValue = Math.floor(Math.random() * 9) + 1;
        
        // Update game state
        gameState.board[row][col] = tileValue;
        gameState.boardOwnership[row][col] = 'player1';
        gameState.scores.player1 += tileValue;
        gameState.currentPlayer = 'player2';
        
        res.json({ success: true, gameState });
        
        // Make computer's move after a delay
        setTimeout(() => {
            const computerMove = findBestMove(gameState.board);
            if (computerMove) {
                const computerTileValue = Math.floor(Math.random() * 9) + 1;
                gameState.board[computerMove.row][computerMove.col] = computerTileValue;
                gameState.boardOwnership[computerMove.row][computerMove.col] = 'player2';
                gameState.scores.player2 += computerTileValue;
                gameState.currentPlayer = 'player1';
            }
        }, 750);
    } catch (error) {
        console.error('Error processing move:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Reset game
router.post('/reset', (req, res) => {
    try {
        gameState = {
            board: Array(7).fill(null).map(() => Array(7).fill(null)),
            boardOwnership: Array(7).fill(null).map(() => Array(7).fill(null)),
            currentPlayer: 'player2',
            scores: { player1: 0, player2: 0 },
            sequences: []
        };
        
        res.json({ success: true, gameState });
        
        // Make computer's first move after a delay
        setTimeout(() => {
            const computerMove = findBestMove(gameState.board);
            if (computerMove) {
                const tileValue = Math.floor(Math.random() * 9) + 1;
                gameState.board[computerMove.row][computerMove.col] = tileValue;
                gameState.boardOwnership[computerMove.row][computerMove.col] = 'player2';
                gameState.currentPlayer = 'player1';
            }
        }, 1500);
    } catch (error) {
        console.error('Error resetting game:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add route to save game history
router.post('/save-history', async (req, res) => {
    try {
        const gameHistory = new GameHistory(req.body);
        await gameHistory.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving game history:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add route to get game history
router.get('/history', async (req, res) => {
    try {
        const history = await GameHistory.find()
            .sort({ endTime: -1 })
            .limit(10);
        res.json({ success: true, history });
    } catch (error) {
        console.error('Error getting game history:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
