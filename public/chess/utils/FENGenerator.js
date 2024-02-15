import ChessBoard from "../model/board/ChessBoard.js";

export default class FENGenerator {
  static toFEN(board, move, gameState) {
    let fen = "";

    const pieceToFENMap = {
      KING: { WHITE: "K", BLACK: "k" },
      QUEEN: { WHITE: "Q", BLACK: "q" },
      ROOK: { WHITE: "R", BLACK: "r" },
      BISHOP: { WHITE: "B", BLACK: "b" },
      KNIGHT: { WHITE: "N", BLACK: "n" },
      PAWN: { WHITE: "P", BLACK: "p" },
    };

    // 1. Piece placement
    for (let row = 0; row < ChessBoard.ROW_LENGTH; row++) {
      let emptySquares = 0;
      for (let col = 0; col < ChessBoard.COLUMN_LENGTH; col++) {
        const piece = board.getPieceAt(row, col);
        if (piece === null) {
          emptySquares++;
        } else {
          if (emptySquares !== 0) {
            fen += emptySquares;
            emptySquares = 0;
          }
          const pieceFEN =
            pieceToFENMap[piece.getType()][piece.getPlayer().getColor()];
          fen += pieceFEN;
        }
      }
      if (emptySquares !== 0) {
        fen += emptySquares;
      }
      if (row < ChessBoard.ROW_LENGTH - 1) {
        fen += "/";
      }
    }

    // Append other FEN parts (simplified for brevity)
    fen += " " + (gameState.currentPlayer.isWhite() ? "w" : "b");
    fen += " " + generateCastlingAvailability(board);
    fen +=
      " " +
      (move.getEnPassantTarget() ? move.getEnPassantTarget().toString() : "-");
    fen += " " + move.halfMoveClock;
    fen += " " + move.fullMoveNumber;

    return fen;
  }
}

function generateCastlingAvailability(board) {
  let castlingAvailability = "";

  function checkSide(
    majorPieceRow,
    queenSideRookColumn,
    kingSideRookColumn,
    isWhite
  ) {
    const king = board.getBoard()[majorPieceRow][ChessBoard.KING_COLUMN];
    if (king && king.getType() === "KING" && !king.hasMoved) {
      const rookPositions = [kingSideRookColumn, queenSideRookColumn];
      for (let position of rookPositions) {
        const rook = board.getBoard()[majorPieceRow][position];
        if (rook && rook.getType() === "ROOK" && !rook.hasMoved) {
          castlingAvailability += isWhite
            ? position === kingSideRookColumn
              ? "K"
              : "Q"
            : position === kingSideRookColumn
            ? "k"
            : "q";
        }
      }
    }
  }

  checkSide(
    ChessBoard.WHITE_MAJOR_PIECE_ROW,
    ChessBoard.ROOK_COLUMN_1,
    ChessBoard.ROOK_COLUMN_2,
    true
  );

  checkSide(
    ChessBoard.BLACK_MAJOR_PIECE_ROW,
    ChessBoard.ROOK_COLUMN_1,
    ChessBoard.ROOK_COLUMN_2,
    false
  );

  return castlingAvailability || "-";
}
