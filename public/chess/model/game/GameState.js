import PlayerColor from "../player/PlayerColor.js";
import PlayerType from "../player/PlayerType.js";
import GameStateMemento from "./GameStateMemento.js";

class GameState {
  constructor(board, player1, player2) {
    this.board = board;

    this.player1 = player1;
    this.player2 = player2;

    this.init();

    this.isGameOver = false;
    this.isBoardLocked = false;
    this.stockfishElo = -1;
  }

  init() {
    this.board.init(this.player1, this.player2);

    if (this.player1.getColor() === PlayerColor.WHITE) {
      this.currentPlayer = this.player1;
      this.opposingPlayer = this.player2;
    } else {
      this.currentPlayer = this.player2;
      this.opposingPlayer = this.player1;
    }

    this.capturedPieces = [];
    this.player1CapturedPieces = [];
    this.player2CapturedPieces = [];
  }

  createMemento() {
    return new GameStateMemento(
      this.currentPlayer,
      this.opposingPlayer,
      this.player1,
      this.player2,
      this.capturedPieces,
      this.player1CapturedPieces,
      this.player2CapturedPieces
    );
  }

  restoreFromMemento(memento) {
    this.currentPlayer = memento.getCurrentPlayer();
    this.opposingPlayer = memento.getOpposingPlayer();
    this.player1 = memento.getPlayer1();
    this.player2 = memento.getPlayer2();
    this.capturedPieces = [...memento.getCapturedPieces()];
    this.player1CapturedPieces = [...memento.getPlayer1CapturedPieces()];
    this.player2CapturedPieces = [...memento.getPlayer2CapturedPieces()];
  }

  swapPlayers() {
    const temp = this.currentPlayer;
    this.currentPlayer = this.opposingPlayer;
    this.opposingPlayer = temp;
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  setCurrentPlayerFromFEN(activeColor) {
    this.currentPlayer =
      (activeColor === "w") === this.player1.isWhite()
        ? this.player1
        : this.player2;
    this.opposingPlayer =
      (activeColor === "w") === this.player1.isWhite()
        ? this.player2
        : this.player1;
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

  lockBoard() {
    this.isBoardLocked = true;
  }

  unlockBoard() {
    this.isBoardLocked = false;
  }

  isStockfish() {
    return this.currentPlayer.isStockfish();
  }

  getStockfishElo() {
    return this.stockfishElo;
  }

  isGameOver() {
    return this.isGameOver;
  }

  setGameOver(gameOver) {
    this.isGameOver = gameOver;
  }

  addCapturedPiece(capturedPiece) {
    this.capturedPieces.push(capturedPiece);
    this.updateCapturedPieces();
  }

  removeCapturedPiece(capturedPiece) {
    const index1 = this.player1CapturedPieces.indexOf(capturedPiece);
    if (index1 > -1) {
      this.player1CapturedPieces.splice(index1, 1);
    }

    const index2 = this.player2CapturedPieces.indexOf(capturedPiece);
    if (index2 > -1) {
      this.player2CapturedPieces.splice(index2, 1);
    }
  }

  updateCapturedPieces() {
    this.capturedPieces.forEach((piece) => {
      if (
        piece.getPlayer() === this.player1 &&
        !this.player1CapturedPieces.includes(piece)
      ) {
        this.player1CapturedPieces.push(piece);
      } else if (
        piece.getPlayer() === this.player2 &&
        !this.player2CapturedPieces.includes(piece)
      ) {
        this.player2CapturedPieces.push(piece);
      }
    });
  }

  getPlayer1CapturedPieces() {
    return this.player1CapturedPieces;
  }

  getPlayer2CapturedPieces() {
    return this.player2CapturedPieces;
  }
}

export default GameState;
