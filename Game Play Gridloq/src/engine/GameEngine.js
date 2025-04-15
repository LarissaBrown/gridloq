import * as PIXI from 'pixi.js';

class GameEngine {
    constructor() {
        this.app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundColor: 0x1099bb,
            resolution: window.devicePixelRatio || 1,
        });

        this.currentState = null;
        this.states = new Map();
        this.lastTime = 0;
        this.deltaTime = 0;
    }

    init() {
        document.body.appendChild(this.app.view);
        this.app.ticker.add(this.gameLoop.bind(this));
    }

    addState(name, state) {
        this.states.set(name, state);
    }

    setState(name) {
        if (this.currentState) {
            this.currentState.exit();
        }

        const newState = this.states.get(name);
        if (newState) {
            this.currentState = newState;
            this.currentState.enter();
        }
    }

    gameLoop(delta) {
        this.deltaTime = delta;
        
        if (this.currentState) {
            this.currentState.update(this.deltaTime);
            this.currentState.render();
        }
    }

    getDeltaTime() {
        return this.deltaTime;
    }

    getApp() {
        return this.app;
    }
}

export default GameEngine; 