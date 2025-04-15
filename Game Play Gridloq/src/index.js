import GameEngine from './engine/GameEngine';
import MainMenuState from './states/MainMenuState';

// Initialize the game engine
const gameEngine = new GameEngine();

// Add game states
gameEngine.addState('mainMenu', new MainMenuState(gameEngine));

// Start the game
gameEngine.init();
gameEngine.setState('mainMenu'); 