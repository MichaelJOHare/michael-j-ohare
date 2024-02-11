import Square from "../../board/Square.js";
import BaseMovementStrategy from "./BaseMovementStrategy.js";
import ChessBoard from "../../board/ChessBoard.js";
import Move from "../../moves/Move.js";
import CastlingMove from "../../moves/CastlingMove.js";
import Rook from "../Rook.js";
import King from "../King.js";

class KingMovementStrategy extends BaseMovementStrategy {
  calculateLegalMoves(board, piece, moveHistory) {
    let legalMoves = super.calculateLegalMoves(board, piece, moveHistory);
    this.addCastlingMoves(board, piece, legalMoves, moveHistory);
    return legalMoves;
  }

  calculateRawLegalMoves(
    board,
    piece,
    /* eslint-disable-line no-unused-vars */ moveHistory
  ) {
    let rawLegalMoves = [];
    let row = piece.getCurrentSquare().getRow();
    let col = piece.getCurrentSquare().getCol();

    // 8 directions similar to Queen but only one step
    let directions = [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];

    directions.forEach((direction) => {
      let targetRow = row + direction[0];
      let targetCol = col + direction[1];

      if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
        let currentSquare = piece.getCurrentSquare();
        let targetSquare = new Square(targetRow, targetCol);

        if (board.isOccupied(targetRow, targetCol)) {
          if (
            board.isOccupiedByOpponent(targetRow, targetCol, piece.getPlayer())
          ) {
            let capturedPiece = board.getPieceAt(targetRow, targetCol);
            let tempMove = new Move(
              piece,
              currentSquare,
              targetSquare,
              capturedPiece,
              board
            );
            rawLegalMoves.push(tempMove);
          }
        } else {
          let tempMove = new Move(
            piece,
            currentSquare,
            targetSquare,
            null,
            board
          );
          rawLegalMoves.push(tempMove);
        }
      }
    });
    return rawLegalMoves;
  }

  addCastlingMoves(board, piece, legalMoves, moveHistory) {
    if (
      piece instanceof King &&
      !piece.getHasMoved() &&
      !board.isKingInCheck(piece.getPlayer(), moveHistory, board)
    ) {
      this.addKingSideCastlingMove(board, piece, legalMoves);
      this.addQueenSideCastlingMove(board, piece, legalMoves);
    }
  }

  addKingSideCastlingMove(board, king, legalMoves) {
    const rookSquare = new Square(
      king.getCurrentSquare().getRow(),
      ChessBoard.ROOK_COLUMN_2
    );
    const rook = board.getPieceAt(rookSquare.getRow(), rookSquare.getCol());

    if (
      rook instanceof Rook &&
      !rook.getHasMoved() &&
      board.isEmpty(
        king.getCurrentSquare().getRow(),
        king.getCurrentSquare().getCol() + 1
      ) &&
      board.isEmpty(
        king.getCurrentSquare().getRow(),
        king.getCurrentSquare().getCol() + 2
      )
    ) {
      if (
        !board.isSquareAttackedByOpponent(
          king.getCurrentSquare().getRow(),
          king.getCurrentSquare().getCol() + 1,
          king.getPlayer()
        ) &&
        !board.isSquareAttackedByOpponent(
          king.getCurrentSquare().getRow(),
          king.getCurrentSquare().getCol() + 2,
          king.getPlayer()
        )
      ) {
        legalMoves.push(
          new CastlingMove(
            king,
            rook,
            king.getCurrentSquare(),
            new Square(
              king.getCurrentSquare().getRow(),
              king.getCurrentSquare().getCol() + 2
            ),
            rookSquare,
            new Square(rookSquare.getRow(), rookSquare.getCol() - 2),
            board
          )
        );
      }
    }
  }

  addQueenSideCastlingMove(board, king, legalMoves) {
    const rookSquare = new Square(
      king.getCurrentSquare().getRow(),
      ChessBoard.ROOK_COLUMN_1
    );
    const rook = board.getPieceAt(rookSquare.getRow(), rookSquare.getCol());

    if (
      rook instanceof Rook &&
      !rook.getHasMoved() &&
      board.isEmpty(
        king.getCurrentSquare().getRow(),
        king.getCurrentSquare().getCol() - 1
      ) &&
      board.isEmpty(
        king.getCurrentSquare().getRow(),
        king.getCurrentSquare().getCol() - 2
      )
    ) {
      if (
        !board.isSquareAttackedByOpponent(
          king.getCurrentSquare().getRow(),
          king.getCurrentSquare().getCol() - 1,
          king.getPlayer()
        ) &&
        !board.isSquareAttackedByOpponent(
          king.getCurrentSquare().getRow(),
          king.getCurrentSquare().getCol() - 2,
          king.getPlayer()
        )
      ) {
        legalMoves.push(
          new CastlingMove(
            king,
            rook,
            king.getCurrentSquare(),
            new Square(
              king.getCurrentSquare().getRow(),
              king.getCurrentSquare().getCol() - 2
            ),
            rookSquare,
            new Square(rookSquare.getRow(), rookSquare.getCol() + 3),
            board
          )
        );
      }
    }
  }
}

export default KingMovementStrategy;
