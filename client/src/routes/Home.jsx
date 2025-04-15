import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { ColorPicker } from "../components/ColorPicker";
import { useAuth0 } from "@auth0/auth0-react";

// Predefined color options (you can add more)
const colorOptions = [
  '#FFD25C', // Gold
  '#FF6B6B', // Coral
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue
  '#96CEB4', // Sage
  '#D4A5A5', // Rose
  '#9B59B6', // Purple
  '#3498DB', // Blue
  '#E67E22', // Orange
  '#2ECC71'  // Green
];

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px #fff, 0 0 10px #ffd700, 0 0 15px #ffd700, 0 0 20px #ffd700; }
  100% { box-shadow: 0 0 10px #fff, 0 0 20px #ffd700, 0 0 30px #ffd700, 0 0 40px #ffd700; }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 60px);
  gap: 4px;
  padding: 20px;
  margin: 0 auto;
  width: fit-content;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 12px;
`;

const Square = styled.div`
  width: 60px;
  height: 60px;
  border: 1px solid #ccc;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: ${props => props.currentPlayer === 1 && !props.value ? 'pointer' : 'default'};
  background-color: ${props => {
    if (!props.owner && !props.value) return '#FFD25C'; // Default yellow for empty squares
    if (!props.owner) return '#FFD25C'; // Keep yellow if no owner
    const baseColor = props.owner === 1 ? props.player1Color : props.player2Color;
    return props.inSequence ? darkenColor(baseColor, 20) : baseColor;
  }};
  animation: ${props => props.isWinning ? glowAnimation : 'none'} 1.5s ease-in-out infinite alternate;
  transition: all 0.3s ease;
  margin: 2px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  color: ${props => props.isWinning ? '#ffffff' : '#000000'};
  text-shadow: ${props => props.isWinning ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none'};
  font-weight: ${props => props.isWinning ? 'bold' : 'normal'};
  
  &:hover {
    transform: ${props => props.currentPlayer === 1 && !props.value && 'scale(1.05)'};
  }
`;

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
`;

const AnnouncementPopup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px 40px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  z-index: 1000;
  text-align: center;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, -60%); }
    to { opacity: 1; transform: translate(-50%, -50%); }
  }

  h2 {
    margin: 0;
    font-size: 24px;
    color: #333;
  }

  p {
    margin: 10px 0;
    font-size: 20px;
    color: #666;
  }
`;

// Helper function to darken colors
const darkenColor = (color, amount) => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
};

export const Home = () => {
  const { isAuthenticated, user } = useAuth0();
  
  const createInitialState = () => ({
    board: Array(7).fill().map(() => Array(7).fill(null)),
    boardOwnership: Array(7).fill().map(() => Array(7).fill(null)),
    currentPlayer: Math.random() < 0.5 ? 1 : 2, // Randomly choose first player
    scores: { 1: 0, 2: 0 },
    sequences: []
  });

  const [gameState, setGameState] = useState(createInitialState);
  const [player1Color, setPlayer1Color] = useState(null);
  const [player2Color] = useState('#FF7276');
  const [showColorPicker, setShowColorPicker] = useState(true);
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  // Clear any existing game data when component mounts
  useEffect(() => {
    localStorage.removeItem('currentGame');
  }, []);

  // Calculate potential sequence value
  const calculateSequenceValue = (board, positions) => {
    return positions.reduce((sum, pos) => sum + (board[pos.row][pos.col] || 0), 0);
  };

  // Find all potential sequences from a position
  const findPotentialSequences = (board, ownership, row, col, player) => {
    const directions = [
      [[0,1], [0,2]], // horizontal
      [[1,0], [2,0]], // vertical
      [[1,1], [2,2]], // diagonal right
      [[1,-1], [2,-2]] // diagonal left
    ];

    const sequences = [];
    directions.forEach(([[dy1,dx1], [dy2,dx2]]) => {
      const row1 = row + dy1, col1 = col + dx1;
      const row2 = row + dy2, col2 = col + dx2;
      
      if (row2 >= 0 && row2 < 7 && col2 >= 0 && col2 < 7) {
        const owner1 = ownership[row1]?.[col1];
        const owner2 = ownership[row2]?.[col2];
        
        if ((!owner1 || owner1 === player) && (!owner2 || owner2 === player)) {
          sequences.push([
            {row, col},
            {row: row1, col: col1},
            {row: row2, col: col2}
          ]);
        }
      }
    });
    return sequences;
  };

  // Improved strategic move finder
  const findBestMove = () => {
    const board = gameState.board;
    const ownership = gameState.boardOwnership;
    let bestMove = null;
    let bestScore = -Infinity;

    // Check each empty spot
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (!board[row][col]) {
          // Evaluate offensive potential
          const offensiveSequences = findPotentialSequences(board, ownership, row, col, 2);
          let offensiveScore = 0;
          offensiveSequences.forEach(seq => {
            const value = calculateSequenceValue(board, seq);
            offensiveScore += value * 2; // Weight offensive moves higher
          });

          // Evaluate defensive potential
          const defensiveSequences = findPotentialSequences(board, ownership, row, col, 1);
          let defensiveScore = 0;
          defensiveSequences.forEach(seq => {
            const value = calculateSequenceValue(board, seq);
            defensiveScore += value * 1.5; // Block high-value sequences
          });

          // Position strategy (prefer center and corners)
          const positionScore = 
            (row === 3 && col === 3) ? 10 : // Center
            (row === 0 || row === 6) && (col === 0 || col === 6) ? 5 : // Corners
            0;

          const totalScore = offensiveScore + defensiveScore + positionScore;
          
          if (totalScore > bestScore) {
            bestScore = totalScore;
            bestMove = {row, col};
          }
        }
      }
    }

    return bestMove || {row: 3, col: 3}; // Default to center if no good moves found
  };

  const makeComputerMove = () => {
    const move = findBestMove();
    if (move) {
      const newState = { ...gameState };
      newState.board[move.row][move.col] = Math.floor(Math.random() * 9) + 1;
      newState.boardOwnership[move.row][move.col] = 2;
      newState.currentPlayer = 1;
      updateGameState(newState);
      localStorage.setItem('currentGame', JSON.stringify(newState));
    }
  };

  const handleMove = (row, col) => {
    if (gameState.board[row][col] || gameState.currentPlayer !== 1) return;

    const newState = { ...gameState };
    newState.board[row][col] = Math.floor(Math.random() * 9) + 1;
    newState.boardOwnership[row][col] = 1;
    newState.currentPlayer = 2;
    updateGameState(newState);
    localStorage.setItem('currentGame', JSON.stringify(newState));

    setTimeout(() => makeComputerMove(), 500);
  };

  const handleColorSelect = (color) => {
    setPlayer1Color(color);
    setShowColorPicker(false);
    
    // Create new game state with random first player
    const newState = createInitialState();
    setGameState(newState);
    
    // Show announcement
    setShowAnnouncement(true);
    
    // Hide announcement and start game after 2 seconds
    setTimeout(() => {
      setShowAnnouncement(false);
      if (newState.currentPlayer === 2) {
        makeComputerMove();
      }
    }, 2000);
  };

  const resetGame = () => {
    setShowColorPicker(true);
    setGameState(createInitialState());
    localStorage.removeItem('currentGame');
    setPlayer1Color(null);
  };

  // Function to check for sequences
  const findSequences = (board, ownership) => {
    const sequences = [];
    
    // Check horizontal sequences
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (ownership[row][col] && 
            ownership[row][col] === ownership[row][col+1] && 
            ownership[row][col] === ownership[row][col+2]) {
          sequences.push({
            owner: ownership[row][col],
            positions: [
              {row, col},
              {row, col: col+1},
              {row, col: col+2}
            ]
          });
        }
      }
    }
    
    // Check vertical sequences
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 7; col++) {
        if (ownership[row][col] && 
            ownership[row][col] === ownership[row+1][col] && 
            ownership[row][col] === ownership[row+2][col]) {
          sequences.push({
            owner: ownership[row][col],
            positions: [
              {row, col},
              {row: row+1, col},
              {row: row+2, col}
            ]
          });
        }
      }
    }
    
    // Check diagonal sequences (both directions)
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        // Diagonal right
        if (ownership[row][col] && 
            ownership[row][col] === ownership[row+1][col+1] && 
            ownership[row][col] === ownership[row+2][col+2]) {
          sequences.push({
            owner: ownership[row][col],
            positions: [
              {row, col},
              {row: row+1, col: col+1},
              {row: row+2, col: col+2}
            ]
          });
        }
        
        // Diagonal left
        if (col >= 2 && ownership[row][col] && 
            ownership[row][col] === ownership[row+1][col-1] && 
            ownership[row][col] === ownership[row+2][col-2]) {
          sequences.push({
            owner: ownership[row][col],
            positions: [
              {row, col},
              {row: row+1, col: col-1},
              {row: row+2, col: col-2}
            ]
          });
        }
      }
    }
    
    return sequences;
  };

  const updateGameState = (newState) => {
    const sequences = findSequences(newState.board, newState.boardOwnership);
    newState.sequences = sequences;
    
    // Calculate scores from sequences
    const scores = { 1: 0, 2: 0 };
    sequences.forEach(seq => {
      const sum = calculateSequenceValue(newState.board, seq.positions);
      scores[seq.owner] += sum;
    });
    newState.scores = scores;
    
    setGameState(newState);
    localStorage.setItem('currentGame', JSON.stringify(newState));
  };

  const isInSequence = (row, col) => {
    return gameState.sequences?.some(seq => 
      seq.positions?.some(pos => pos.row === row && pos.col === col)
    ) || false;
  };

  const isWinning = (player) => {
    return (gameState.scores?.[player] || 0) > (gameState.scores?.[player === 1 ? 2 : 1] || 0);
  };

  // Safe render with error boundary
  try {
    if (showColorPicker) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <ColorPicker onSelect={handleColorSelect} />
        </div>
    );
    }

  return (
      <GameContainer>
      {showAnnouncement && (
        <AnnouncementPopup>
          <h2>Game Start!</h2>
          <p>{gameState.currentPlayer === 1 ? "You go first!" : "I go first!"}</p>
        </AnnouncementPopup>
      )}
      <h1>Gridloq</h1>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
          <span>Player 1: {gameState.scores[1]}</span>
          <span style={{ margin: '0 20px' }}>Player 2: {gameState.scores[2]}</span>
    </div>
        <button 
          onClick={resetGame}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginBottom: '20px'
          }}
        >
          Reset Game
        </button>
        
        <GridContainer>
          {gameState.board.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {row.map((value, colIndex) => (
                <Square
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleMove(rowIndex, colIndex)}
                  value={value}
                  owner={gameState.boardOwnership[rowIndex][colIndex]}
                  player1Color={player1Color}
                  player2Color={player2Color}
                  currentPlayer={gameState.currentPlayer}
                  inSequence={isInSequence(rowIndex, colIndex)}
                  isWinning={gameState.boardOwnership[rowIndex][colIndex] && 
                            isWinning(gameState.boardOwnership[rowIndex][colIndex])}
                >
                  {value}
                </Square>
              ))}
            </React.Fragment>
          ))}
        </GridContainer>
      </GameContainer>
    );
  } catch (error) {
    console.error('Render error:', error);
    return <div>Something went wrong. Please try refreshing the page.</div>;
  }
};
