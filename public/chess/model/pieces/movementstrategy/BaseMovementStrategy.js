import Move from "../../moves/Move.js";

class BaseMovementStrategy {
  calculateLegalMoves(board, piece, moveHistory) {
    const rawLegalMoves = this.calculateRawLegalMoves(
      board,
      piece,
      moveHistory
    );
    const legalMoves = [];

    for (const move of rawLegalMoves) {
      if (!this.wouldResultInCheck(board, piece, moveHistory, move)) {
        legalMoves.push(move);
      }
    }
    return legalMoves;
  }

  wouldResultInCheck(board, piece, moveHistory, move) {
    const copiedBoard = board.copy();
    const copiedMoveHistory = moveHistory.copy();
    const copiedPiece = piece.copy();
    const copiedCapturedPiece = move.getCapturedPiece()
      ? move.getCapturedPiece().copy()
      : null;
    const copiedPlayer = copiedPiece.getPlayer();

    const copiedMove = new Move(
      copiedPiece,
      move.getStartSquare(),
      move.getEndSquare(),
      copiedCapturedPiece,
      copiedBoard
    );

    copiedMoveHistory.makeMove(copiedMove);
    copiedBoard.initializePieceManager();

    return copiedBoard.isKingInCheck(
      copiedPlayer,
      copiedMoveHistory,
      copiedBoard
    );
  }

  /**
   * Calculates the raw legal moves for a piece on the board.
   * This method is abstract and must be implemented by subclasses.
   *
   * @param {Board} board - The game board.
   * @param {Piece} piece - The piece to calculate moves for.
   * @param {Array} moveHistory - The history of moves made in the game.
   * @throws {Error} Throws an error if not implemented.
   */
  calculateRawLegalMoves() {
    throw new Error("calculateRawLegalMoves must be implemented by subclasses");
  }
}

export default BaseMovementStrategy;
