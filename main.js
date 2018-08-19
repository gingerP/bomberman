(async () => {
  try {
    const game = new BMGame(15, 10);
    await game.init();
    await game.runCycle();
  } catch (error) {
    console.error(error);
  }
})();
