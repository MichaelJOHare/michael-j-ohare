import BaseMovementStrategy from "./BaseMovementStrategy.js";
import Move from "../../moves/Move.js";
import Square from "../../board/Square.js";
import EnPassantMove from "../../moves/EnPassantMove.js";
import PromotionMove from "../../moves/PromotionMove.js";
import PieceType from "../PieceType.js";

class PawnMovementStrategy extends BaseMovementStrategy {
  calculateRawLegalMoves(board, piece, moveHistory) {
    let legalMoves = [];
    let row = piece.getCurrentSquare().getRow();
    let col = piece.getCurrentSquare().getCol();

    this.addNormalMoves(row, col, piece, board, legalMoves);
    this.addEnPassantMoves(row, col, piece, board, moveHistory, legalMoves);
    this.addPromotionMoves(row, col, piece, board, legalMoves);
    return legalMoves;
  }

  addNormalMoves(row, col, piece, board, legalMoves) {
    const direction = piece.getPlayer().isWhite() ? -1 : 1;
    const backRank = piece.getPlayer().isWhite() ? 0 : 7;
    const startingRow = piece.getPlayer().isWhite() ? 6 : 1;

    this.handleNormalMove(
      row,
      col,
      direction,
      backRank,
      piece,
      board,
      legalMoves
    );
    this.handleDoubleMove(
      row,
      col,
      direction,
      startingRow,
      piece,
      board,
      legalMoves
    );
    // Left capture
    this.handleCapture(row, col, direction, -1, piece, board, legalMoves);
    // Right capture
    this.handleCapture(row, col, direction, 1, piece, board, legalMoves);
  }

  handleNormalMove(row, col, direction, backRank, piece, board, legalMoves) {
    if (
      (direction === -1 && row - 1 > backRank) ||
      (direction === 1 && row + 1 < backRank)
    ) {
      const newRow = row + direction;
      if (board.isEmpty(newRow, col)) {
        legalMoves.push(
          new Move(
            piece,
            new Square(row, col),
            new Square(newRow, col),
            null,
            board
          )
        );
      }
    }
  }

  handleDoubleMove(row, col, direction, startingRow, piece, board, legalMoves) {
    if (
      row === startingRow &&
      board.isEmpty(row + direction, col) &&
      board.isEmpty(row + 2 * direction, col)
    ) {
      legalMoves.push(
        new Move(
          piece,
          new Square(row, col),
          new Square(row + 2 * direction, col),
          null,
          board
        )
      );
    }
  }

  handleCapture(row, col, direction, colOffset, piece, board, legalMoves) {
    const newRow = row + direction;
    const newCol = col + colOffset;
    if (
      newCol >= 0 &&
      newCol <= 7 &&
      newRow >= 1 &&
      newRow <= 6 &&
      board.isOccupiedByOpponent(newRow, newCol, piece.getPlayer())
    ) {
      legalMoves.push(
        new Move(
          piece,
          new Square(row, col),
          new Square(newRow, newCol),
          board.getPieceAt(newRow, newCol),
          board
        )
      );
    }
  }

  addEnPassantMoves(row, col, piece, board, moveHistory, legalMoves) {
    const enPassantStartingRow = piece.getPlayer().isWhite() ? 1 : 6;
    const enPassantEndRow = piece.getPlayer().isWhite() ? 3 : 4;
    const direction = piece.getPlayer().isWhite() ? -1 : 1;
    const lastMove = moveHistory.getLastMove();

    if (
      lastMove !== null &&
      lastMove.getPiece().getType() === PieceType.PAWN &&
      lastMove.getStartSquare().getRow() === enPassantStartingRow &&
      lastMove.getEndSquare().getRow() === enPassantEndRow &&
      row === enPassantEndRow &&
      Math.abs(col - lastMove.getEndSquare().getCol()) === 1
    ) {
      const currentSquare = new Square(row, col);
      const targetSquare = new Square(
        row + direction,
        lastMove.getEndSquare().getCol()
      );
      const capturedPiece = lastMove.getPiece();
      const originalSquareBeforeCapture = lastMove
        .getPiece()
        .getCurrentSquare();
      const tempMove = new EnPassantMove(
        piece,
        currentSquare,
        targetSquare,
        originalSquareBeforeCapture,
        capturedPiece,
        board
      );
      legalMoves.push(tempMove);
    }
  }

  addPromotionMoves(row, col, piece, board, legalMoves) {
    const direction = piece.getPlayer().isWhite() ? -1 : 1;
    const rowBeforePromotionRow = piece.getPlayer().isWhite() ? 1 : 6;

    // Captures with promotion
    this.handlePromotionCapture(
      row,
      col,
      direction,
      1,
      piece,
      board,
      legalMoves
    );
    this.handlePromotionCapture(
      row,
      col,
      direction,
      -1,
      piece,
      board,
      legalMoves
    );

    // Normal move with promotion
    if (row === rowBeforePromotionRow && board.isEmpty(row + direction, col)) {
      ["QUEEN", "ROOK", "BISHOP", "KNIGHT"].forEach((promotionType) => {
        const promotionMove = new PromotionMove(
          piece,
          new Square(row, col),
          new Square(row + direction, col),
          null,
          PieceType[promotionType],
          board
        );
        promotionMove.setPromotion(true);
        legalMoves.push(promotionMove);
      });
    }
  }

  handlePromotionCapture(
    row,
    col,
    direction,
    colOffset,
    piece,
    board,
    legalMoves
  ) {
    const newRow = row + direction;
    const newCol = col + colOffset;
    const rowBeforePromotionRow = piece.getPlayer().isWhite() ? 1 : 6;

    if (
      row === rowBeforePromotionRow &&
      newCol >= 0 &&
      newCol < 8 &&
      board.isOccupiedByOpponent(newRow, newCol, piece.getPlayer())
    ) {
      ["QUEEN", "ROOK", "BISHOP", "KNIGHT"].forEach((promotionType) => {
        const promotionMove = new PromotionMove(
          piece,
          new Square(row, col),
          new Square(newRow, newCol),
          board.getPieceAt(newRow, newCol),
          PieceType[promotionType],
          board
        );
        promotionMove.setPromotion(true);
        legalMoves.push(promotionMove);
      });
    }
  }
}

export default PawnMovementStrategy;
