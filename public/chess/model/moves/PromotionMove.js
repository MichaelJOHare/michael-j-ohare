import Move from "./Move.js";
import PiecePromotion from "../pieces/PiecePromotion.js";

class PromotionMove extends Move {
  constructor(
    pawn,
    startSquare,
    endSquare,
    capturedPiece,
    promotionType,
    board
  ) {
    super(pawn, startSquare, endSquare, capturedPiece, board);
    this.promotionType = promotionType;
    this.originalPiece = pawn;
    this.promotedPiece = null;
  }

  setPromotionType(promotionType) {
    this.promotionType = promotionType;
  }

  getPromotionType() {
    return this.promotionType;
  }

  getPromotedPiece() {
    return this.promotedPiece;
  }

  getOriginalPiece() {
    return this.originalPiece;
  }

  execute() {
    if (this.capturedPiece !== null) {
      this.capturedPiece.kill();
      this.board.removePiece(this.capturedPiece);
    }

    const chosenPromotion = this.getPromotionType();
    this.promotedPiece = PiecePromotion.promotePiece(
      chosenPromotion,
      this.originalPiece.getPlayer(),
      this.endSquare
    );
    this.board.removePiece(this.originalPiece);
    this.piece = this.promotedPiece;
    this.board.addPiece(this.promotedPiece);
  }

  undo() {
    this.board.removePiece(this.promotedPiece);

    this.originalPiece.setCurrentSquare(this.startSquare);
    this.board.addPiece(this.originalPiece);

    if (this.capturedPiece !== null) {
      this.capturedPiece.revive();
      this.board.removePiece(this.capturedPiece);
      this.capturedPiece.setCurrentSquare(this.endSquare);
      this.board.addPiece(this.capturedPiece);
    }
  }

  redo() {
    this.board.removePiece(this.originalPiece);
    this.piece = this.promotedPiece;
    this.board.addPiece(this.promotedPiece);
    this.promotedPiece.setCurrentSquare(this.endSquare);
  }
}

export default PromotionMove;
