const mongoose = require('mongoose');

// Position Schema (reusable for moves and sequences)
const positionSchema = new mongoose.Schema({
    row: {
        type: Number,
        required: true,
        min: 0,
        max: 6
    },
    col: {
        type: Number,
        required: true,
        min: 0,
        max: 6
    },
    value: {
        type: Number,
        required: true,
        min: 1,
        max: 9
    }
});

// Move Schema
const moveSchema = new mongoose.Schema({
    player: {
        type: String,
        required: true,
        enum: ['player1', 'player2']
    },
    position: positionSchema,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Sequence Schema
const sequenceSchema = new mongoose.Schema({
    positions: [positionSchema],
    owner: {
        type: String,
        required: true,
        enum: ['player1', 'player2']
    },
    score: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Simple version to get started
const gameSchema = new mongoose.Schema({
    gameId: {
        type: String,
        required: true,
        unique: true
    },
    board: {
        type: [[Number]],
        default: () => Array(7).fill(null).map(() => Array(7).fill(null))
    },
    boardOwnership: {
        type: [[String]],
        default: () => Array(7).fill(null).map(() => Array(7).fill(null))
    },
    currentPlayer: {
        type: String,
        enum: ['player1', 'player2'],
        default: 'player2'
    },
    scores: {
        player1: {
            type: Number,
            default: 0
        },
        player2: {
            type: Number,
            default: 0
        }
    },
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active'
    },
    moves: [{
        player: String,
        row: Number,
        col: Number,
        value: Number,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    sequences: [sequenceSchema],
    winner: {
        type: String,
        enum: ['player1', 'player2', null],
        default: null
    }
}, {
    timestamps: true
});

// Add methods to the game schema
gameSchema.methods.addMove = function(player, row, col, value) {
    this.moves.push({
        player,
        position: { row, col, value }
    });
    this.board[row][col] = value;
    this.boardOwnership[row][col] = player;
    return this.save();
};

gameSchema.methods.updateScore = function(player, score) {
    this.scores[player] = score;
    return this.save();
};

gameSchema.methods.addSequence = function(positions, owner, score) {
    this.sequences.push({ positions, owner, score });
    return this.save();
};

gameSchema.methods.endGame = function(winner) {
    this.status = 'completed';
    this.winner = winner;
    return this.save();
};

module.exports = mongoose.model('Game', gameSchema);
