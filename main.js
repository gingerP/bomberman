(async () => {
  try {
    const game = new BMGame(20, 15);
    await game.init();
    await game.runCycle();
  } catch (error) {
    console.error(error);
  }
})();
