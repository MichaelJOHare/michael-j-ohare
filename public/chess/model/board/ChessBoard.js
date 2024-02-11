import Square from "./Square.js";
import PieceManager from "../player/PieceManager.js";
import MoveHistory from "../moves/MoveHistory.js";
import Pawn from "../pieces/Pawn.js";
import Rook from "../pieces/Rook.js";
import Bishop from "../pieces/Bishop.js";
import Knight from "../pieces/Knight.js";
import Queen from "../pieces/Queen.js";
import King from "../pieces/King.js";
import Move from "../moves/Move.js";

class ChessBoard {
  static ROW_LENGTH = 8;
  static COLUMN_LENGTH = 8;
  static WHITE_PAWN_ROW = 6;
  static BLACK_PAWN_ROW = 1;
  static WHITE_MAJOR_PIECE_ROW = 7;
  static BLACK_MAJOR_PIECE_ROW = 0;
  static ROOK_COLUMN_1 = 0;
  static ROOK_COLUMN_2 = 7;
  static KNIGHT_COLUMN_1 = 1;
  static KNIGHT_COLUMN_2 = 6;
  static BISHOP_COLUMN_1 = 2;
  static BISHOP_COLUMN_2 = 5;
  static QUEEN_COLUMN = 3;
  static KING_COLUMN = 4;

  constructor() {
    this.board = Array.from({ length: ChessBoard.ROW_LENGTH }, () =>
      new Array(ChessBoard.COLUMN_LENGTH).fill(null)
    );
    this.pieceManager = null;
  }

  init(player1, player2) {
    this.clearBoard();
    this.initializeBoard(player1, player2);
    this.initializePieceManager();
  }

  clearBoard() {
    for (let row = 0; row < ChessBoard.COLUMN_LENGTH; row++) {
      for (let col = 0; col < ChessBoard.ROW_LENGTH; col++) {
        this.board[row][col] = null;
      }
    }
  }

  initializeBoard(player1, player2) {
    if (player1.isWhite()) {
      this.initializeMajorPieces(
        player1,
        ChessBoard.WHITE_MAJOR_PIECE_ROW,
        player2,
        ChessBoard.BLACK_MAJOR_PIECE_ROW
      );
      this.initializePawnRows(
        player1,
        ChessBoard.WHITE_PAWN_ROW,
        player2,
        ChessBoard.BLACK_PAWN_ROW
      );
    } else {
      this.initializeMajorPieces(
        player1,
        ChessBoard.BLACK_MAJOR_PIECE_ROW,
        player2,
        ChessBoard.WHITE_MAJOR_PIECE_ROW
      );
      this.initializePawnRows(
        player1,
        ChessBoard.BLACK_PAWN_ROW,
        player2,
        ChessBoard.WHITE_PAWN_ROW
      );
    }
  }

  initializeBoardFromFEN(fenString, player1, player2) {
    this.clearBoard();

    const [
      position,
      activeColor,
      castlingAvailability,
      enPassantTarget,
      halfMoveClock,
      fullMoveNumber,
    ] = fenString.split(" ");

    const whitePlayer = player1.isWhite() ? player1 : player2;
    const blackPlayer = player1.isWhite() ? player2 : player1;

    const rows = position.split("/");
    for (let row = 0; row < rows.length; row++) {
      let col = 0;
      for (const char of rows[row]) {
        if (Number.isInteger(parseInt(char))) {
          col += parseInt(char);
        } else {
          const player =
            char === char.toUpperCase() ? whitePlayer : blackPlayer;
          this.board[row][col] = this.fenToPiece(char, player, row, col);
          col++;
        }
      }
    }

    this.setCastlingFlags(castlingAvailability);
    const epMove =
      enPassantTarget != "-"
        ? this.setEnPassantTarget(enPassantTarget, activeColor)
        : null;
    this.initializePieceManager();
    const boardContext = { activeColor, epMove, halfMoveClock, fullMoveNumber };
    return boardContext;
  }

  setCastlingFlags(castlingAvailability) {
    this.markAllKingsAndRooksAsMoved();

    if (castlingAvailability.includes("K")) {
      this.markKingAndRookAsNotMoved(
        ChessBoard.WHITE_MAJOR_PIECE_ROW,
        ChessBoard.KING_COLUMN,
        ChessBoard.ROOK_COLUMN_2
      );
    }
    if (castlingAvailability.includes("Q")) {
      this.markKingAndRookAsNotMoved(
        ChessBoard.WHITE_MAJOR_PIECE_ROW,
        ChessBoard.KING_COLUMN,
        ChessBoard.ROOK_COLUMN_1
      );
    }
    if (castlingAvailability.includes("k")) {
      this.markKingAndRookAsNotMoved(
        ChessBoard.BLACK_MAJOR_PIECE_ROW,
        ChessBoard.KING_COLUMN,
        ChessBoard.ROOK_COLUMN_2
      );
    }
    if (castlingAvailability.includes("q")) {
      this.markKingAndRookAsNotMoved(
        ChessBoard.BLACK_MAJOR_PIECE_ROW,
        ChessBoard.KING_COLUMN,
        ChessBoard.ROOK_COLUMN_1
      );
    }
  }

  markAllKingsAndRooksAsMoved() {
    for (let row = 0; row < ChessBoard.ROW_LENGTH; row++) {
      for (let col = 0; col < ChessBoard.COLUMN_LENGTH; col++) {
        let piece = this.board[row][col];
        if (piece && typeof piece.setHasMoved === "function") {
          piece.setHasMoved(true);
        }
      }
    }
  }

  markKingAndRookAsNotMoved(row, kingCol, rookCol) {
    const king = this.board[row][kingCol];
    if (king && king instanceof King) {
      king.setHasMoved(false);
    }

    const rook = this.board[row][rookCol];
    if (rook && rook instanceof Rook) {
      rook.setHasMoved(false);
    }
  }

  setEnPassantTarget(epTargetSquare, activeColor) {
    const epSquare = Square.getSquareFromNotation(epTargetSquare);
    const directionTraveled = activeColor === "w" ? -1 : 1;
    const directionFrom = activeColor === "w" ? 1 : -1;
    const originSquare = new Square(epSquare.row + directionFrom, epSquare.col);
    const destinationSquare = new Square(
      epSquare.row + directionTraveled,
      epSquare.col
    );
    const epPawn = this.board.getPieceAt(
      epSquare.row + directionTraveled,
      epSquare.col
    );
    const epMove = new Move(
      epPawn,
      originSquare,
      destinationSquare,
      null,
      this
    );
    return epMove;
  }

  fenToPiece(fenChar, player, row, col) {
    const square = new Square(row, col);
    const lowerChar = fenChar.toLowerCase();

    switch (lowerChar) {
      case "k":
        return new King(square, player);
      case "q":
        return new Queen(square, player);
      case "r":
        return new Rook(square, player);
      case "b":
        return new Bishop(square, player);
      case "n":
        return new Knight(square, player);
      case "p":
        return new Pawn(square, player);
      default:
        throw new Error("Invalid FEN character: " + fenChar);
    }
  }

  initializeMajorPieces(player1, player1Row, player2, player2Row) {
    const pieceMap = this.createPieceMap();

    this.placeMajorPiecesForRow(player1Row, player1, pieceMap);
    this.placeMajorPiecesForRow(player2Row, player2, pieceMap);
  }

  createPieceMap() {
    const pieceMap = {
      [ChessBoard.ROOK_COLUMN_1]: (square, player) => new Rook(square, player),
      [ChessBoard.ROOK_COLUMN_2]: (square, player) => new Rook(square, player),
      [ChessBoard.KNIGHT_COLUMN_1]: (square, player) =>
        new Knight(square, player),
      [ChessBoard.KNIGHT_COLUMN_2]: (square, player) =>
        new Knight(square, player),
      [ChessBoard.BISHOP_COLUMN_1]: (square, player) =>
        new Bishop(square, player),
      [ChessBoard.BISHOP_COLUMN_2]: (square, player) =>
        new Bishop(square, player),
      [ChessBoard.QUEEN_COLUMN]: (square, player) => new Queen(square, player),
      [ChessBoard.KING_COLUMN]: (square, player) => new King(square, player),
    };
    return pieceMap;
  }

  placeMajorPiecesForRow(row, player, pieceMap) {
    for (let col = 0; col < ChessBoard.ROW_LENGTH; col++) {
      if (pieceMap[col]) {
        this.placePiece(row, col, pieceMap[col](new Square(row, col), player));
      }
    }
  }

  initializePawnRows(player1, row1, player2, row2) {
    this.initializePawnRow(row1, player1);
    this.initializePawnRow(row2, player2);
  }

  initializePawnRow(row, player) {
    for (let col = 0; col < ChessBoard.ROW_LENGTH; col++) {
      this.placePiece(row, col, new Pawn(new Square(row, col), player));
    }
  }

  placePiece(row, col, piece) {
    this.board[row][col] = piece;
  }

  getBoard() {
    return this.board;
  }

  isEmpty(row, col) {
    return this.board[row][col] === null;
  }

  getPieceAt(row, col) {
    return this.board[row][col];
  }

  addPiece(piece) {
    const currentSquare = piece.getCurrentSquare();
    const row = currentSquare.getRow();
    const col = currentSquare.getCol();
    this.board[row][col] = piece;
  }

  removePiece(piece) {
    const currentSquare = piece.getCurrentSquare();
    const row = currentSquare.getRow();
    const col = currentSquare.getCol();
    this.board[row][col] = null;
  }

  isKingInCheck(player, move, board) {
    const kingSquare = this.pieceManager.findKingSquare(player);
    for (const piece of this.pieceManager.getOpposingPieces(player)) {
      const pieceMoves = piece.calculateRawLegalMoves(board, move);
      for (const m of pieceMoves) {
        if (m.getPiece().isAlive() && m.getEndSquare().equals(kingSquare)) {
          return true;
        }
      }
    }
    return false;
  }

  isSquareAttackedByOpponent(row, col, player) {
    for (const piece of this.pieceManager.getOpposingPieces(player)) {
      if (piece instanceof Pawn && piece.isAlive()) {
        if (
          this.isSquareAttackedByPawn(
            piece.getCurrentSquare().getRow(),
            piece.getCurrentSquare().getCol(),
            row,
            col,
            player
          )
        ) {
          return true;
        }
      } else {
        const pieceMoves = piece.calculateRawLegalMoves(
          this,
          new MoveHistory()
        );
        for (const m of pieceMoves) {
          if (
            m.getPiece().isAlive() &&
            m.getEndSquare().getRow() === row &&
            m.getEndSquare().getCol() === col
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  isSquareAttackedByPawn(pawnRow, pawnCol, kingRow, targetCol, player) {
    if (player.isWhite()) {
      return (
        pawnRow + 1 === kingRow &&
        (pawnCol - 1 === targetCol || pawnCol + 1 === targetCol)
      );
    } else {
      return (
        pawnRow - 1 === kingRow &&
        (pawnCol - 1 === targetCol || pawnCol + 1 === targetCol)
      );
    }
  }

  initializePieceManager() {
    this.pieceManager = new PieceManager(this);
  }

  getPieceManager() {
    return this.pieceManager;
  }

  isOccupied(row, col) {
    const piece = this.getPieceAt(row, col);
    return piece !== null;
  }

  isOccupiedByOpponent(row, col, player) {
    const piece = this.getPieceAt(row, col);
    return piece !== null && !piece.getPlayer().equals(player);
  }

  copy() {
    const copiedBoard = new ChessBoard();
    for (let row = 0; row < ChessBoard.ROW_LENGTH; row++) {
      for (let col = 0; col < ChessBoard.COLUMN_LENGTH; col++) {
        const currentPiece = this.board[row][col];
        if (currentPiece !== null) {
          const copiedPiece = currentPiece.copy();
          copiedBoard.board[row][col] = copiedPiece;
        }
      }
    }

    copiedBoard.initializePieceManager();

    return copiedBoard;
  }

  toString() {
    let builder = "";
    for (let row = 0; row < ChessBoard.ROW_LENGTH; row++) {
      for (let col = 0; col < ChessBoard.COLUMN_LENGTH; col++) {
        let piece = this.board[row][col];
        if (piece !== null) {
          builder += `${piece}@(${row}, ${col})\n`;
        }
      }
    }
    return builder;
  }
}

export default ChessBoard;
