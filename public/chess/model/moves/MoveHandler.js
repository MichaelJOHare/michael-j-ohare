import Square from "../board/Square.js";

class MoveHandler {
  constructor(
    board,
    moveHistory,
    gameState,
    guiController,
    mementos,
    pieceManager
  ) {
    this.board = board;
    this.move = moveHistory;
    this.gs = gameState;
    this.gui = guiController;
    this.mementos = mementos;
    this.pm = pieceManager;
    this.isFirstClick = true;
    this.selectedPiece = null;
    this.promotionResolver = null;
    this.moves = [];
  }

  handleSelectPieceClick(row, col) {
    this.selectedPiece = this.board.getPieceAt(row, col);

    if (
      this.selectedPiece === null ||
      this.selectedPiece.getPlayer() !== this.gs.getCurrentPlayer()
    ) {
      return;
    }

    if (this.selectedPiece.getPlayer() === this.gs.getCurrentPlayer()) {
      this.moves = this.selectedPiece.calculateLegalMoves(
        this.board,
        this.move
      );
      if (this.moves.length > 0) {
        this.gui.setHighlightedSquares(this.moves);
        this.gui.updateGUI();
      } else {
        return;
      }
      this.isFirstClick = false;
    }
  }

  async handleMovePieceClick(row, col) {
    if (!this.selectedPiece) {
      this.isFirstClick = true;
      return;
    }

    const targetSquare = new Square(row, col);
    let pieceAtTargetSquare = this.board.getPieceAt(row, col);

    if (
      pieceAtTargetSquare !== null &&
      pieceAtTargetSquare.getPlayer() === this.gs.getCurrentPlayer()
    ) {
      this.handleSelectPieceClick(row, col);
      return;
    }

    let legalMove = this.moves.find((m) =>
      m.getEndSquare().equals(targetSquare)
    );

    if (!legalMove) {
      this.gui.setHighlightedSquares(this.moves);
      this.gui.updateGUI();
      return;
    }

    await this.finalizeMove(legalMove);
    this.handleCheckAndCheckmate();
    this.gui.updateGUI();
  }

  handleDragStart(row, col) {
    this.selectedPiece = this.board.getPieceAt(row, col);

    if (
      this.selectedPiece === null ||
      this.selectedPiece.getPlayer() !== this.gs.getCurrentPlayer()
    ) {
      this.gui.updateGUI();
      return;
    }

    if (this.selectedPiece.getPlayer() === this.gs.getCurrentPlayer()) {
      this.moves = this.selectedPiece.calculateLegalMoves(
        this.board,
        this.move
      );
      if (this.moves.length > 0) {
        this.gui.setHighlightedSquares(this.moves);
        this.gui.drawBoard();
        return;
      } else {
        this.gui.updateGUI();
        return;
      }
    }
    return;
  }

  async handleDragDrop(endRow, endCol) {
    const targetSquare = new Square(endRow, endCol);
    let legalMove = this.moves.find((m) =>
      m.getEndSquare().equals(targetSquare)
    );

    if (
      !legalMove ||
      this.selectedPiece.getPlayer() !== this.gs.getCurrentPlayer()
    ) {
      this.isFirstClick = true;
      this.selectedPiece = null;
      this.gui.updateGUI();
      return;
    }

    await this.finalizeMove(legalMove);
    this.handleCheckAndCheckmate();
    this.gui.updateGUI();
  }

  async finalizeMove(legalMove) {
    try {
      if (legalMove.isPromotion && !this.gs.getCurrentPlayer().isStockfish()) {
        const result = await new Promise((resolve) => {
          this.promotionResolver = resolve;
          this.gui.handlePawnPromotion(legalMove, (promotionType) => {
            if (promotionType) {
              legalMove.setPromotionType(promotionType);
              resolve("continue");
            }
          });
        });
        if (result === "continue") {
          this.mementos.push(this.gs.createMemento());
          this.continueFinalizingMove(legalMove);
        }
      } else {
        this.mementos.push(this.gs.createMemento());
        this.continueFinalizingMove(legalMove);
      }
    } catch (error) {
      console.error("An error occurred during move finalization:", error);
    } finally {
      this.promotionResolver = null;
    }
  }

  continueFinalizingMove(legalMove) {
    this.move.makeMove(legalMove);
    this.pm.handlePromotion(this.move.getLastMove());
    // this.handleCapturedPieces(legalMove, false);
    this.isFirstClick = true;
    this.gs.swapPlayers();
    this.gui.setHighlightedSquaresPreviousMove(legalMove);
  }

  cancelPromotion(action) {
    if (this.promotionResolver) {
      this.promotionResolver(action);
      this.promotionResolver = null;
    }
  }

  handleCheckAndCheckmate() {
    let playerPieces = this.pm
      .getPlayerPieces(this.gs.getCurrentPlayer())
      .filter((piece) => piece.isAlive());

    let opponentPieces = this.pm
      .getPlayerPieces(this.gs.getOpposingPlayer())
      .filter((piece) => piece.isAlive());

    let hasLegalMoves = false;

    for (let piece of playerPieces) {
      if (piece.calculateLegalMoves(this.board, this.move).length > 0) {
        hasLegalMoves = true;
        break;
      }
    }

    if (this.move.getHalfMoveClock() === 100) {
      this.gs.setGameOver(true);
      //this.gui.drawLogText();
    }

    if (
      !hasLegalMoves &&
      this.board.isKingInCheck(
        this.gs.getCurrentPlayer(),
        this.move,
        this.board
      )
    ) {
      this.gs.setGameOver(true);
      this.gui.setKingCheckHighlightedSquare(
        this.pm.findKingSquare(this.gs.getCurrentPlayer())
      );
      this.move.getLastMove().checkState = "checkmate";
    } else if (
      !hasLegalMoves ||
      (playerPieces.length === 1 && opponentPieces.length === 1)
    ) {
      this.gs.setGameOver(true);
      // this.gui.stalemateLogText();
    } else if (
      this.board.isKingInCheck(
        this.gs.getCurrentPlayer(),
        this.move,
        this.board
      )
    ) {
      this.gui.setKingCheckHighlightedSquare(
        this.pm.findKingSquare(this.gs.getCurrentPlayer())
      );
      this.move.getLastMove().checkState = "check";
    } else {
      this.gui.clearKingCheckHighlightedSquare(
        this.pm.findKingSquare(this.gs.getOpposingPlayer())
      );
    }
  }

  handleUndoMove() {
    const undoCount = this.gs.getOpposingPlayer().isStockfish() ? 2 : 1;

    for (let i = 0; i < undoCount; i++) {
      if (this.mementos.length < 1) {
        //this.gui.nothingLeftToUndoLogText(); or maybe grey button out
        return;
      }
      this.handleSingleUndo();
    }
    this.finalizeUndoRedo();
  }

  handleSingleUndo() {
    if (this.gs.isGameOver) {
      this.gs.setGameOver(false);
    }

    //handleCapturedPieces(this.move.getLastMove(), true);
    this.pm.handleUndoPromotion(this.move.getLastMove());

    this.move.undoMove();
    const memento = this.mementos.pop();
    this.gs.restoreFromMemento(memento);
  }

  handleRedoMove() {
    const redoCount = this.gs.getOpposingPlayer().isStockfish() ? 2 : 1;

    for (let i = 0; i < redoCount; i++) {
      if (this.move.undone.length < 1) {
        //this.gui.nothingLeftToRedoLogText(); or maybe grey button out
        return;
      }
      this.handleSingleRedo();
    }
    this.finalizeUndoRedo();
  }

  handleSingleRedo() {
    this.move.redoMove();
    this.pm.handlePromotion(this.move.getLastMove());
    this.mementos.push(this.gs.createMemento());
    this.isFirstClick = true;
    this.gs.swapPlayers();
  }

  finalizeUndoRedo() {
    this.selectedPiece = null;
    this.isFirstClick = true;
    this.gui.clearHighlightedSquares();
    let previousMoveToHighlight = this.move.getLastMove();
    if (previousMoveToHighlight) {
      this.gui.setHighlightedSquaresPreviousMove(this.move.getLastMove());
    }
    this.handleCheckAndCheckmate();
    this.gui.updateGUI();
  }

  //handleCapturedPieces(legalMove, isUndo) {}
}

export default MoveHandler;
