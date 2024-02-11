class GameStateMemento {
  constructor(
    currentPlayer,
    opposingPlayer,
    player1,
    player2,
    capturedPieces,
    player1CapturedPieces,
    player2CapturedPieces
  ) {
    this.currentPlayer = currentPlayer;
    this.opposingPlayer = opposingPlayer;
    this.player1 = player1;
    this.player2 = player2;
    this.capturedPieces = [...capturedPieces];
    this.player1CapturedPieces = [...player1CapturedPieces];
    this.player2CapturedPieces = [...player2CapturedPieces];
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  getOpposingPlayer() {
    return this.opposingPlayer;
  }

  getPlayer1() {
    return this.player1;
  }

  getPlayer2() {
    return this.player2;
  }

  getCapturedPieces() {
    return [...this.capturedPieces];
  }

  getPlayer1CapturedPieces() {
    return [...this.player1CapturedPieces];
  }

  getPlayer2CapturedPieces() {
    return [...this.player2CapturedPieces];
  }
}

export default GameStateMemento;
