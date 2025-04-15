import BaseState from './BaseState';
import * as PIXI from 'pixi.js';

class MainMenuState extends BaseState {
    constructor(gameEngine) {
        super(gameEngine);
        this.init();
    }

    init() {
        // Create title text
        const titleStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fill: '#ffffff',
            align: 'center'
        });

        const title = new PIXI.Text('Gridloq', titleStyle);
        title.anchor.set(0.5);
        title.x = this.gameEngine.getApp().screen.width / 2;
        title.y = 100;

        // Create start button
        const buttonStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fill: '#ffffff',
            align: 'center'
        });

        const startButton = new PIXI.Text('Start Game', buttonStyle);
        startButton.anchor.set(0.5);
        startButton.x = this.gameEngine.getApp().screen.width / 2;
        startButton.y = 200;
        startButton.interactive = true;
        startButton.buttonMode = true;

        startButton.on('pointerdown', () => {
            this.gameEngine.setState('gameplay');
        });

        this.container.addChild(title);
        this.container.addChild(startButton);
    }

    update(deltaTime) {
        // Update logic for main menu
    }

    render() {
        // Render logic for main menu
    }
}

export default MainMenuState; 