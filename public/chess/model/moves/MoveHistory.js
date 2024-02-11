import PieceType from "../pieces/PieceType.js";
import PlayerColor from "../player/PlayerColor.js";
import Pawn from "../pieces/Pawn.js";
import Square from "../board/Square.js";

class MoveHistory {
  constructor() {
    this.history = [];
    this.undone = [];
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
  }

  makeMove(move) {
    move.execute();
    if (move.getPiece().getType() === PieceType.PAWN || move.isCapture) {
      this.halfMoveClock = 0;
    } else {
      this.halfMoveClock++;
    }
    if (move.getPiece().getPlayer().getColor() === PlayerColor.BLACK) {
      this.fullMoveNumber++;
    }
    this.history.push(move);
    this.undone = [];
  }

  undoMove() {
    if (this.history.length > 0) {
      const lastMove = this.history.pop();
      this.resetMoveClocksForUndo(lastMove);
      this.resetHasMovedFlagForUndo(lastMove);
      lastMove.undo();
      this.undone.push(lastMove);
    }
  }

  redoMove() {
    if (this.undone.length > 0) {
      const redoMove = this.undone.pop();
      this.resetMoveClocksForRedo(redoMove);
      this.resetHasMovedFlagForRedo(redoMove);
      redoMove.redo();
      this.history.push(redoMove);
    }
  }

  getLastMove() {
    return this.history.length > 0
      ? this.history[this.history.length - 1]
      : null;
  }

  getHalfMoveClock() {
    return this.halfMoveClock;
  }

  getFullMoveNumber() {
    return this.fullMoveNumber;
  }

  getEnPassantTarget() {
    const lastMove = this.getLastMove();
    if (lastMove && lastMove.getPiece() instanceof Pawn) {
      const difference =
        lastMove.getEndSquare().getRow() - lastMove.getStartSquare().getRow();
      if (Math.abs(difference) === 2) {
        return new Square(
          (lastMove.getEndSquare().getRow() +
            lastMove.getStartSquare().getRow()) /
            2,
          lastMove.getStartSquare().getCol()
        );
      }
    }
    return null;
  }

  resetMoveClocksForUndo(lastMove) {
    if (
      lastMove.getPiece().getType() === PieceType.PAWN ||
      lastMove.isCapture
    ) {
      this.halfMoveClock = this.calculateHalfMoveClockFromHistory();
    } else {
      this.halfMoveClock--;
    }

    if (lastMove.getPiece().getPlayer().getColor() === PlayerColor.BLACK) {
      this.fullMoveNumber--;
    }
  }

  resetMoveClocksForRedo(redoMove) {
    if (
      redoMove.getPiece().getType() === PieceType.PAWN ||
      redoMove.isCapture
    ) {
      this.halfMoveClock = 0;
    } else {
      this.halfMoveClock++;
    }

    if (redoMove.getPiece().getPlayer().getColor() === PlayerColor.BLACK) {
      this.fullMoveNumber++;
    }
  }

  resetHasMovedFlagForUndo(move) {
    const piece = move.getPiece();
    if (typeof piece.setHasMoved === "function") {
      piece.setHasMoved(false);
    }
  }

  resetHasMovedFlagForRedo(move) {
    const piece = move.getPiece();
    if (typeof piece.setHasMoved === "function") {
      piece.setHasMoved(true);
    }
  }

  calculateHalfMoveClockFromHistory() {
    let counter = 0;
    for (let i = this.history.length - 1; i >= 0; i--) {
      const move = this.history[i];
      if (move.getPiece().getType() === PieceType.PAWN || move.isCapture) {
        break;
      }
      counter++;
    }
    return counter;
  }

  copy() {
    const copiedHistory = new MoveHistory();

    if (this.history.length > 0) {
      this.history.forEach((move) => {
        copiedHistory.history.push(move.copy());
      });
    }

    if (this.undone.length > 0) {
      this.undone.forEach((move) => {
        copiedHistory.undone.push(move.copy());
      });
    }

    copiedHistory.halfMoveClock = this.halfMoveClock;
    copiedHistory.fullMoveNumber = this.fullMoveNumber;

    return copiedHistory;
  }

  resetMoveHistory() {
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
    this.history = [];
    this.undone = [];
  }
}

export default MoveHistory;
