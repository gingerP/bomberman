(async () => {
  try {
    const game = new BMGame(10, 10);
    await game.init();
    await game.runCycle();
  } catch (error) {
    console.error(error);
  }
})();
