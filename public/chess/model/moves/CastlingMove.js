import Move from "./Move.js";

class CastlingMove extends Move {
  constructor(king, rook, kingFrom, kingTo, rookFrom, rookTo, board) {
    super(king, kingFrom, kingTo, null, board);
    this.rook = rook;
    this.rookStartSquare = rookFrom;
    this.rookEndSquare = rookTo;
  }

  execute() {
    super.execute();
    this.board.removePiece(this.rook);
    this.rook.setCurrentSquare(this.rookEndSquare);
    this.board.addPiece(this.rook);
    this.rook.setHasMoved(true);
  }

  undo() {
    super.undo();
    this.board.removePiece(this.rook);
    this.rook.setCurrentSquare(this.rookStartSquare);
    this.board.addPiece(this.rook);
    this.rook.setHasMoved(false);
  }

  redo() {
    super.redo();
    this.board.removePiece(this.rook);
    this.rook.setCurrentSquare(this.rookEndSquare);
    this.board.addPiece(this.rook);
  }
}

export default CastlingMove;
