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
    const state = this.previousState;
    if (state) {
      if (state.status === BombStatuses.ACTIVATED) {
        const {x, y} = state.position;
        context.clearRect(
          x * 50, y * 50,
          50, 50
        );
      } else if (state.status === BombStatuses.EXPLOSION) {
        const {x, y} = state.position;
        const {top, right, bottom, left} = state.directionsForExplosion;
        const topLeftX = x * 50 - (left ? 50 : 0);
        const topLeftY = y * 50 - (top ? 50 : 0);
        let width = 150;
        if (!left && !right) {
          width = 50;
        } else if (!left && right || !right && left) {
          width = 100;
        }
        let height = 150;
        if (!top && !bottom) {
          height = 50;
        } else if (!top && bottom || !bottom && top) {
          height = 100;
        }
        console.info(topLeftX, topLeftY,width, height);
        context.clearRect(
          topLeftX, topLeftY,
          width, height
        );
      }
    }
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
      const {top, right, bottom, left} = state.directionsForExplosion;

      context.drawImage(
        this.fireImage,
        this.fireImageParts.center[0], 0,
        50, 50,
        x * 50, y * 50,
        50, 50
      );

      if (top) {
        context.drawImage(
          this.fireImage,
          this.fireImageParts.top[0], 0,
          50, 50,
          x * 50, y * 50 - 50,
          50, 50
        );
      }
      if (right) {
        context.drawImage(
          this.fireImage,
          this.fireImageParts.right[0], 0,
          50, 50,
          x * 50 + 50, y * 50,
          50, 50
        );
      }
      if (bottom) {
        context.drawImage(
          this.fireImage,
          this.fireImageParts.bottom[0], 0,
          50, 50,
          x * 50, y * 50 + 50,
          50, 50
        );
      }
      if (left) {
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
}
