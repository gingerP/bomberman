(async () => {
  try {
    const game = new BMGame(18, 18);
    await game.init();
  } catch (error) {
    console.error(error);
  }
})();
