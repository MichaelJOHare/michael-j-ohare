import PieceType from "../pieces/PieceType.js";

class PieceManager {
  constructor(board) {
    this.piecesByPlayer = new Map();
    this.initPieces(board);
  }

  initPieces(board) {
    const boardArray = board.getBoard();
    for (let row of boardArray) {
      for (let piece of row) {
        if (piece !== null) {
          const player = piece.getPlayer();
          if (!this.piecesByPlayer.has(player)) {
            this.piecesByPlayer.set(player, []);
          }
          this.piecesByPlayer.get(player).push(piece);
        }
      }
    }
  }

  getPlayerPieces(player) {
    return this.piecesByPlayer.get(player) || [];
  }

  removePiece(piece) {
    const owner = piece.getPlayer();
    const playerPieces = this.piecesByPlayer.get(owner);
    if (playerPieces) {
      const index = playerPieces.indexOf(piece);
      if (index > -1) {
        playerPieces.splice(index, 1);
      }
    }
  }

  addPiece(piece) {
    const owner = piece.getPlayer();
    if (!this.piecesByPlayer.has(owner)) {
      this.piecesByPlayer.set(owner, []);
    }
    this.piecesByPlayer.get(owner).push(piece);
  }

  findKingSquare(player) {
    const pieces = this.piecesByPlayer.get(player) || [];
    for (let piece of pieces) {
      if (piece.getType() === PieceType.KING) {
        return piece.getCurrentSquare();
      }
    }
    return null;
  }

  handlePromotion(move) {
    if (move.isPromotion) {
      this.removePiece(move.getOriginalPiece());
      this.addPiece(move.getPromotedPiece());
    }
  }

  handleUndoPromotion(move) {
    if (move && move.isPromotion) {
      this.removePiece(move.getPromotedPiece());
      this.addPiece(move.getOriginalPiece());
    }
  }

  getOpposingPieces(player) {
    const opposingPieces = [];
    for (let [key, pieces] of this.piecesByPlayer.entries()) {
      if (key !== player) {
        opposingPieces.push(...pieces);
      }
    }
    return opposingPieces;
  }
}

export default PieceManager;
