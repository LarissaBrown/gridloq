const mongoose = require('mongoose');

const moveSchema = new mongoose.Schema({
    player: String,
    position: {
        row: Number,
        col: Number
    },
    value: Number,
    timestamp: Date
});

const gameHistorySchema = new mongoose.Schema({
    gameId: {
        type: String,
        required: true,
        unique: true
    },
    startTime: Date,
    endTime: Date,
    moves: [moveSchema],
    finalBoard: [[Number]],
    finalBoardOwnership: [[String]],
    winner: String,
    finalScores: {
        player1: Number,
        player2: Number
    },
    sequences: [{
        positions: [{
            row: Number,
            col: Number,
            value: Number
        }],
        owner: String,
        score: Number
    }]
});

module.exports = mongoose.model('GameHistory', gameHistorySchema); 