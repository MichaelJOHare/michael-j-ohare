import Move from "./Move.js";
import Pawn from "../pieces/Pawn.js";

class EnPassantMove extends Move {
  constructor(
    piece,
    from,
    to,
    originalSquareBeforeCapture,
    capturedPiece,
    board
  ) {
    super(piece, from, to, capturedPiece, board);
    this.originalSquareBeforeCapture = originalSquareBeforeCapture;
  }

  undo() {
    if (this.capturedPiece !== null && this.capturedPiece instanceof Pawn) {
      this.capturedPiece.revive();
      this.board.removePiece(this.capturedPiece);
      this.capturedPiece.setCurrentSquare(this.originalSquareBeforeCapture);
      this.board.addPiece(this.capturedPiece);
    }
    this.board.removePiece(this.piece);
    this.piece.setCurrentSquare(this.startSquare);
    this.board.addPiece(this.piece);
  }
}

export default EnPassantMove;
