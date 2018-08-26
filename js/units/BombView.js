class BMBombView {
  constructor() {
    this.odd = false;
    this.startTime = null;
    this.bombImage = null;
    this.fireImage = null;
    this.fireImageParts = {
      top: [0, 0],
      right: [50, 0],
      bottom: [100, 0],
      left: [150, 0],
      center: [200, 0]
    };
  }

  async init() {
    [this.bombImage, this.fireImage] = await Promise.all([
      BMGameViewUtils.loadImage('images/bomb.png'),
      BMGameViewUtils.loadImage('images/fire.png')
    ]);
  }

  clearPreviousFrame(context) {

  }

  runAnimation() {
  }

  render(context, state, time) {
    this.startTime = this.startTime || time;
    this.previousState = state;
    if (state.status === BombStatuses.ACTIVATED) {
      this.odd = !this.odd;
      const {position} = state;
      const {aX, aY, aWidth, aHeight} = this.bombAnimationFunction(time);
      context.drawImage(
        this.bombImage,
        0,
        0,
        50,
        50,

        position.x * 50 + aX,
        position.y * 50 + aY,
        aWidth,
        aHeight
      );
    } else if (state.status === BombStatuses.EXPLOSION) {
      const {x, y} = state.position;
      const {top, right, bottom, left} = this.prepareExplosionsFromState(x, y, state.explosions);
      context.drawImage(
        this.fireImage,
        this.fireImageParts.center[0], 0,
        50, 50,
        x * 50, y * 50,
        50, 50
      );
      if (top.length) {
        context.drawImage(
          this.fireImage,
          this.fireImageParts.top[0], 0,
          50, 50,
          x * 50, y * 50 - 50,
          50, 50
        );
      }
      if (right.length) {
        context.drawImage(
          this.fireImage,
          this.fireImageParts.right[0], 0,
          50, 50,
          x * 50 + 50, y * 50,
          50, 50
        );
      }
      if (bottom.length) {
        context.drawImage(
          this.fireImage,
          this.fireImageParts.bottom[0], 0,
          50, 50,
          x * 50, y * 50 + 50,
          50, 50
        );
      }
      if (left.length) {
        context.drawImage(
          this.fireImage,
          this.fireImageParts.left[0], 0,
          50, 50,
          x * 50 - 50, y * 50,
          50, 50
        );
      }
    } else if (state.status === BombStatuses.PREPARE_TO_DESTROY) {
      this.clearPreviousFrame(context);
    }
  }

  destroy(context) {
    this.clearPreviousFrame(context);
  }

  bombAnimationFunction(time) {
    const dTime = time - this.startTime;
    const step = Math.floor(dTime / 100);
    const cycleStep = step % 10;
    const delta = cycleStep < 5 ? cycleStep : 10 - cycleStep;
    return {
      aX: delta,
      aY: delta,
      aWidth: 50 - delta * 2,
      aHeight: 50 - delta * 2
    };
  }

  prepareExplosionsFromState(x, y, explosions) {
    const directions = {center: [y, x], top: [], right: [], bottom: [], left: []};
    let index = explosions.length;
    while (index--) {
      const explosion = explosions[index];
      if (explosion[2]) {
        if (explosion[0] === y && explosion[1] > x) {
          directions.right.push(explosion);
        } else if (explosion[0] === y && explosion[1] < x) {
          directions.left.push(explosion);
        } else if (explosion[0] > y && explosion[1] === x) {
          directions.bottom.push(explosion);
        } else if (explosion[0] < y && explosion[1] === x) {
          directions.top.push(explosion);
        }
      }
    }
    directions.top.sort((a, b) => b[0] - a[0]);
    directions.right.sort((a, b) => a[1] - b[1]);
    directions.bottom.sort((a, b) => a[0] - b[0]);
    directions.left.sort((a, b) => b[1] - a[1]);
    return directions;
  }
}
