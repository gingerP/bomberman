class BMGamePanelView extends BMObservable {

  constructor(cellSize = 50, width = 10, height = 10) {
    super();
    this.cellSize = cellSize;
    this.width = width;
    this.height = height;
    this.bindView();
    this.setSize(this.width, this.height);
  }

  async init() {
    await this.loadResources();

    this.drawBackground(this.images.background);
  }

  bindView() {
    this.canvas = document.getElementById('game-panel');
    if (this.canvas.getContext) {
      this.context = this.canvas.getContext('2d');
    } else {
      throw new Error('Canvas not supported.');
    }
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.canvas.setAttribute('width', `${this.width * this.cellSize}px`);
    this.canvas.setAttribute('height', `${this.height * this.cellSize}px`);
  }

  async drawMap(mapParams) {
    await this.drawBackground(this.images.background);
    for (let y = 0; y < mapParams.length; y++) {
      const row = mapParams[y];
      for (let x = 0; x < row.length; x++) {
        switch (row[x]) {
          case BMGameUtils.POINTS_TYPE_WALL:
            this.context.drawImage(this.images.wall, x * this.cellSize, y * this.cellSize);
            break;
          case BMGameUtils.POINTS_TYPE_DESTRUCTIBLE:
            this.context.drawImage(this.images.destructible, x * this.cellSize, y * this.cellSize);
            break;
          default:
        }
      }
    }
  }

  async loadResources() {
    const newImage = (path) => {
      const image = new Image();
      image.src = path;
      return image;
    };
    this.images = {
      background: newImage('/images/background_01.png'),
      wall: newImage('/images/bricks_01.png'),
      destructible: newImage('/images/wood_01.png'),
      gamer: newImage('/images/gamer_red.png')
    };

    return Promise.all(
      [
        BMGamePanelView.loadResource(this.images.background),
        BMGamePanelView.loadResource(this.images.destructible),
        BMGamePanelView.loadResource(this.images.wall)
      ]
    );
  }

  static async loadResource(image) {
    return new Promise((resolve, reject) => {
      image.addEventListener('load', resolve, false);
      image.addEventListener('error', reject, false);
    });
  }

  drawBackground(image) {
    const pattern = this.context.createPattern(image, 'repeat');
    this.context.fillStyle = pattern;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  async drawGamerState(state) {
    const {position} = state;
    const xPx = (position.x - 0.5) * this.cellSize;
    const yPx = (position.y - 0.5) * this.cellSize;
    this.context.drawImage(this.images.gamer, xPx, yPx);
  }
}
