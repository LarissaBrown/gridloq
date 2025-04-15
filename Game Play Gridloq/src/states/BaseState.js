class BaseState {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.container = new PIXI.Container();
    }

    enter() {
        this.gameEngine.getApp().stage.addChild(this.container);
    }

    exit() {
        this.gameEngine.getApp().stage.removeChild(this.container);
    }

    update(deltaTime) {
        // To be implemented by child classes
    }

    render() {
        // To be implemented by child classes
    }

    handleInput() {
        // To be implemented by child classes
    }
}

export default BaseState; 