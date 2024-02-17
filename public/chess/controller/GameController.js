import ChessBoard from "../model/board/ChessBoard.js";
import GameState from "../model/game/GameState.js";
import MoveHistory from "../model/moves/MoveHistory.js";
import GUIController from "./GUIController.js";
import MoveHandler from "../model/moves/MoveHandler.js";
import FENGenerator from "../utils/FENGenerator.js";
import StockfishController from "./StockfishController.js";

class GameController {
  constructor(player1, player2, stockfishStrengthLevel) {
    this.player1 = player1;
    this.player2 = player2;
    this.stockfishStrengthLevel = stockfishStrengthLevel;
  }

  init() {
    this.board = new ChessBoard();
    this.gs = new GameState(this.board, this.player1, this.player2);
    this.pm = this.board.getPieceManager();
    this.mementos = [];
    this.move = new MoveHistory();

    this.guiController = new GUIController(this.board, this.move, this);
    this.mh = new MoveHandler(
      this.board,
      this.move,
      this.gs,
      this.guiController,
      this.mementos,
      this.pm
    );
    this.sfController = new StockfishController(
      this.board,
      this.move,
      this.gs,
      this.guiController,
      this.stockfishStrengthLevel
    );

    this.initiateGame();
  }

  initiateGame() {
    if (this.gs.getCurrentPlayer().isStockfish()) {
      this.makeStockfishMove();
    }
    this.guiController.writeCurrentFENString();
  }

  initiateGameFromFEN(fenString) {
    const boardContext = this.board.initializeBoardFromFEN(
      fenString,
      this.gs.getPlayer1(),
      this.gs.getPlayer2()
    );

    this.guiController.clearHighlightedSquares();
    this.pm = this.board.getPieceManager();
    this.mementos = [];
    this.mh = new MoveHandler(
      this.board,
      this.move,
      this.gs,
      this.guiController,
      this.mementos,
      this.pm
    );
    this.gs.setGameOver(false);
    this.move.resetMoveHistory();

    this.move.halfMoveClock = boardContext.halfMoveClock;
    this.move.fullMoveNumber = boardContext.fullMoveNumber;
    this.gs.setCurrentPlayerFromFEN(boardContext.activeColor);

    if (boardContext.epMove) {
      this.move.history.push(boardContext.epMove);
    }
    this.mh.handleCheckAndCheckmate();
    this.guiController.updateGUI();
  }

  handleClickToMove(row, col) {
    if (this.gs.isBoardLocked) {
      return;
    }

    if (this.mh.isFirstClick && !this.gs.getCurrentPlayer().isStockfish()) {
      this.mh.handleSelectPieceClick(row, col);
    } else if (
      !this.mh.isFirstClick &&
      !this.gs.getCurrentPlayer().isStockfish()
    ) {
      this.mh.handleMovePieceClick(row, col);
      this.requestStockfishAnalysis();
    }

    if (this.gs.getCurrentPlayer().isStockfish()) {
      this.makeStockfishMove();
    }

    if (this.gs.isGameOver) {
      this.sfController.cleanUp();
    }
  }

  handleDragStart(row, col) {
    if (this.gs.isBoardLocked) {
      return;
    }

    this.mh.handleDragStart(row, col);
  }

  handleDragDrop(endRow, endCol) {
    this.mh.handleDragDrop(endRow, endCol);

    if (this.gs.isGameOver) {
      this.sfController.cleanUp();
    }

    this.gs.getCurrentPlayer().isStockfish()
      ? this.makeStockfishMove()
      : this.requestStockfishAnalysis();
  }

  handlePreviousMoveButtonClick() {
    this.mh.handleUndoMove();
    this.requestStockfishAnalysis();
  }

  handleSingleUndo() {
    this.mh.handleSingleUndo();
  }

  handleNextMoveButtonClick() {
    this.mh.handleRedoMove();
    this.requestStockfishAnalysis();
    if (this.gs.isGameOver) {
      this.sfController.cleanUp();
    }
  }

  handleSingleRedo() {
    this.mh.handleSingleRedo();
  }

  handleCancelPromotion(action) {
    this.mh.cancelPromotion(action);
  }

  generateCurrentFEN() {
    return FENGenerator.toFEN(this.board, this.move, this.gs);
  }

  toggleContinuousAnalysis(enabled) {
    this.sfController.toggleContinuousAnalysis(enabled);
  }

  toggleClassicalContinuousAnalysis(enabled) {
    this.sfController.toggleClassicalContinuousAnalysis(enabled);
  }

  makeStockfishMove() {
    this.sfController
      .getStockfishAsOpponentMove()
      .then((stockfishMove) => {
        this.mh.finalizeMove(stockfishMove);
        this.guiController.updateGUI();
      })
      .catch((error) => {
        console.error("Error getting Stockfish move:", error);
      });
  }

  requestStockfishAnalysis() {
    if (
      this.sfController.isContinuousAnalysisEnabled ||
      this.sfController.isClassicalContinuousAnalysisEnabled
    ) {
      this.sfController.requestAnalysisIfNeeded();
    }
  }

  handleResetBoard() {
    // Maybe attach this event listener in analysis modal, gotta check if everything will be
    //      eligible for garbage collection if new GameController is made
    this.sfController.cleanUp();
    this.guiController.clearHighlightedSquares();
    this.gs.init();
    this.board.init(this.gs.getPlayer1(), this.gs.getPlayer2());
    this.pm = this.board.getPieceManager();
    this.mh.isFirstClick = true;
    this.gs.setGameOver(false);
    this.move.resetMoveHistory();
    this.mementos = [];
    this.mh.mementos = [];
    this.guiController.updateGUI();
    this.initiateGame();
  }
}

export default GameController;
