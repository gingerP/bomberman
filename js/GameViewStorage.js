const GameViewStorage = {
  _storage: {
    images: {}
  },
  loadImage: async function loadImage(path) {
    let image = this._storage.images[path];
    if (!image) {
      image = new Image();
      image.src = path;
      this._storage.images[path] = image;
    }
    if (image._loaded) {
      return image;
    }
    if (image._failed) {
      throw image._failed;
    }
    return new Promise((resolve, reject) => {
      image.addEventListener('load', function () {
        this._loaded = true;
        this._failed = null;
        resolve(image);
      }, false);
      image.addEventListener('error', function (reason) {
        this._loaded = false;
        this._failed = reason;
        reject(reason);
      }, false);
    });
  }
};
