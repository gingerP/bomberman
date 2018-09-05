(async () => {
  try {
    const game = new BMGame(6, 6);
    await game.init();
    await game.runCycle();
  } catch (error) {
    console.error(error);
  }
})();
