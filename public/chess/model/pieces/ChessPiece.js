class ChessPiece {
  #currentSquare;
  #player;
  #type;
  #movementStrategy;
  #isAlive;

  constructor(currentSquare, player, type, movementStrategy) {
    this.#currentSquare = currentSquare;
    this.#player = player;
    this.#type = type;
    this.#movementStrategy = movementStrategy;
    this.#isAlive = true;
  }

  getWhiteChessPieceSymbol() {
    throw new Error(
      "getWhiteChessPieceSymbol must be implemented by subclasses"
    );
  }

  getBlackChessPieceSymbol() {
    throw new Error(
      "getBlackChessPieceSymbol must be implemented by subclasses"
    );
  }

  calculateLegalMoves(board, move) {
    return this.#movementStrategy.calculateLegalMoves(board, this, move);
  }

  calculateRawLegalMoves(board, move) {
    return this.#movementStrategy.calculateRawLegalMoves(board, this, move);
  }

  getCurrentSquare() {
    return this.#currentSquare;
  }

  setCurrentSquare(currentSquare) {
    this.#currentSquare = currentSquare;
  }

  getPlayer() {
    return this.#player;
  }

  getType() {
    return this.#type;
  }

  setType(type) {
    this.#type = type;
  }

  isAlive() {
    return this.#isAlive;
  }

  setIsAlive(isAlive) {
    this.#isAlive = isAlive;
  }

  kill() {
    this.#isAlive = false;
  }

  revive() {
    this.#isAlive = true;
  }

  copy() {
    const copiedPiece = new ChessPiece(
      this.#currentSquare,
      this.#player,
      this.#type,
      this.#movementStrategy
    );
    copiedPiece.setIsAlive(this.#isAlive);
    return copiedPiece;
  }
}
export default ChessPiece;
