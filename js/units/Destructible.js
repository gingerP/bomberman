class Destructible {
  constructor(x, y) {
    this.state = {
      strength: 1,
      totalStrength: 1,
      position: {x, y}
    };
    this.view = new DestructibleView();
  }

  async init() {
    await this.view.init();
  }

  updateTickState(game) {
    const explosions = game.getExplosionsMap();
    const {x, y} = this.state.position;
    if (explosions[y] && explosions[y][x]) {
      console.info(explosions[y][x]);
      this.state.strength -= 0.1 * explosions[y][x];
    }
    this.state.strength = this.state.strength < 0 ? 0 : this.state.strength;
    return this.state;
  }

  getState() {
    return this.state;
  }

  getPosition() {
    return this.state.position;
  }

  toBeDestroyed() {
    return !this.state.strength;
  }
}
