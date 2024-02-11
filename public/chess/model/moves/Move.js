class Move {
  constructor(piece, from, to, capturedPiece, board) {
    this.piece = piece;
    this.startSquare = from;
    this.endSquare = to;
    this.capturedPiece = capturedPiece;
    this.board = board;
    this.isPromotion = false;
    this.isCapture = false;
  }

  execute() {
    if (this.capturedPiece !== null) {
      this.capturedPiece.kill();
      this.board.removePiece(this.capturedPiece);
      this.isCapture = true;
    }
    this.board.removePiece(this.piece);
    this.piece.setCurrentSquare(this.endSquare);
    this.board.addPiece(this.piece);

    if (typeof this.piece.setHasMoved === "function") {
      this.piece.setHasMoved(true);
    }
  }

  undo() {
    this.board.removePiece(this.piece);
    this.piece.setCurrentSquare(this.startSquare);
    this.board.addPiece(this.piece);
    if (this.capturedPiece !== null) {
      this.capturedPiece.revive();
      this.capturedPiece.setCurrentSquare(this.endSquare);
      this.board.addPiece(this.capturedPiece);
    }
  }

  redo() {
    this.execute();
  }

  getPiece() {
    return this.piece;
  }

  setPiece(piece) {
    this.piece = piece;
  }

  getStartSquare() {
    return this.startSquare;
  }

  getEndSquare() {
    return this.endSquare;
  }

  getCapturedPiece() {
    return this.capturedPiece;
  }

  setPromotion(promotion) {
    this.isPromotion = promotion;
  }

  copy() {
    const copiedPiece = this.piece.copy();
    const copiedCapturedPiece = this.capturedPiece
      ? this.capturedPiece.copy()
      : null;
    const copiedBoard = this.board.copy();

    const copiedMove = new Move(
      copiedPiece,
      this.startSquare,
      this.endSquare,
      copiedCapturedPiece,
      copiedBoard
    );

    copiedMove.isPromotion = this.isPromotion;
    copiedMove.isCapture = this.isCapture;

    return copiedMove;
  }
}

export default Move;
