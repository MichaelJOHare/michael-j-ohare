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

  async handleClickToMove(row, col) {
    if (this.gs.isBoardLocked) {
      return;
    }

    if (this.mh.isFirstClick && !this.gs.getCurrentPlayer().isStockfish()) {
      this.mh.handleSelectPieceClick(row, col);
    } else if (
      !this.mh.isFirstClick &&
      !this.gs.getCurrentPlayer().isStockfish()
    ) {
      await this.mh.handleMovePieceClick(row, col);
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

  async handleDragDrop(endRow, endCol) {
    if (this.gs.isBoardLocked) {
      return;
    }

    await this.mh.handleDragDrop(endRow, endCol);

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

  hidePromotionSelector(action) {
    this.guiController.hidePromotionSelector(action);
    this.guiController.clearGameLog();
  }

  generateCurrentFEN() {
    return FENGenerator.toFEN(this.board, this.move, this.gs);
  }

  toggleAnalysis(enabled, analysisType) {
    this.sfController.toggleAnalysis(enabled, analysisType);
  }

  makeStockfishMove() {
    this.gs.isBoardLocked = true;
    // delay 400-1200ms to make move feel more natural
    const delay = Math.random() * (1200 - 400) + 400;
    this.sfController
      .makeStockfishMove()
      .then((stockfishMove) => {
        setTimeout(() => {
          this.mh.finalizeMove(stockfishMove);
          this.mh.handleCheckAndCheckmate();
          this.gs.isBoardLocked = false;
          this.guiController.updateGUI();
        }, delay);
      })
      .catch((error) => {
        this.gs.isBoardLocked = false;
        this.guiController.updateGUI();
        console.error("Error getting Stockfish move:", error);
      });
  }

  requestStockfishAnalysis() {
    this.sfController.requestAnalysisIfNeeded();
  }
}

export default GameController;
