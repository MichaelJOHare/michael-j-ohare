class PromotionSelector {
  constructor(drawBoardCallback, boardContainer, imageLoader) {
    this.drawBoard = drawBoardCallback;
    this.boardContainer = boardContainer;
    this.imageLoader = imageLoader;
    this.isBoardFlipped = false;
    this.isReversed = false;
    this.squareSize = 0;

    this.activePromotionSelector = null;
    this.boardOverlay = null;
  }

  createPromotionSelector(move, callback, squareSize) {
    let promotionPieces = ["Queen", "Rook", "Bishop", "Knight"];
    const color = move.piece.getPlayer().getColor().toLowerCase();
    const colorCapitalized = color.charAt(0).toUpperCase() + color.slice(1);
    const selector = document.createElement("div");
    selector.className = "promotion-selector";
    selector.style.position = "absolute";

    this.activePromotionSelector = {
      selector: selector,
      move: move,
      startSquare: move.getStartSquare(),
      endSquare: move.getEndSquare(),
      selectorSquares: this.calculateSelectorSquares(
        move.getEndSquare(),
        color
      ),
    };

    if (this.reversePromotionPiecesIfNeeded(color)) {
      promotionPieces.reverse();
    }

    this.setSelectorPositionAndSize(selector, move, this.squareSize);
    selector.style.zIndex = "3";
    selector.style.padding = "0";
    selector.style.margin = "0";
    selector.style.lineHeight = "0";
    selector.style.boxSizing = "border-box";

    selector.addEventListener("click", (event) => {
      const clickedElement = event.target;
      const pieceType = clickedElement.getAttribute("data-piece-type");
      if (pieceType) {
        callback(pieceType);
        this.removePromotionSelector();
      }
    });

    // Shade the entire chessboard
    const boardOverlay = document.createElement("div");
    boardOverlay.className = "board-overlay";
    boardOverlay.style.position = "absolute";
    boardOverlay.style.left = "0";
    boardOverlay.style.top = "0";
    boardOverlay.style.width = "100%";
    boardOverlay.style.height = "100%";
    boardOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    boardOverlay.style.zIndex = "2";
    this.boardOverlay = boardOverlay;
    this.boardContainer.appendChild(boardOverlay);

    promotionPieces.forEach((type) => {
      const pieceName = `${colorCapitalized}_${type}`;
      const image = this.imageLoader.pieceImages[pieceName];
      if (image) {
        const img = document.createElement("img");
        img.src = image.src;
        img.style.width = "100%";
        img.style.height = `${squareSize}px`;
        img.style.padding = "0";
        img.style.margin = "0";
        img.style.display = "block";
        img.setAttribute("data-piece-type", type.toUpperCase());
        selector.appendChild(img);
      }
    });

    this.boardContainer.appendChild(selector);
  }

  updateSelectorPositionAndSize() {
    const { selector, move } = this.activePromotionSelector;
    this.setSelectorPositionAndSize(selector, move, this.squareSize);

    Array.from(selector.children).forEach((img) => {
      img.style.height = `${this.squareSize}px`;
    });
  }

  updatePromotionSelector() {
    if (this.activePromotionSelector) {
      this.updateSelectorPositionAndSize();
    }
  }

  flipPromotionSelector() {
    if (this.activePromotionSelector) {
      this.updateSelectorPositionAndSize();

      const { selector, move } = this.activePromotionSelector;
      const color = move.piece.getPlayer().getColor().toLowerCase();

      // If playing as white and board is flipped, there's a mismatch
      const colorBoardOrientationMismatch =
        (color === "white") === this.isBoardFlipped;
      // If mismatch is true and promotion selector is not reversed, should reverse selector
      const shouldReverse = colorBoardOrientationMismatch !== this.isReversed;

      if (shouldReverse) {
        const childrenArray = Array.from(selector.children);
        childrenArray.reverse().forEach((child) => selector.appendChild(child));
        this.isReversed = !this.isReversed;
      }
    }
  }

  setSelectorPositionAndSize(selector, move, squareSize) {
    const pawnPosition = move.getEndSquare();
    const pawnRow = pawnPosition.getRow();
    const pawnCol = pawnPosition.getCol();
    const { visualRow, visualCol } = this.calculateSelectorPosition(
      pawnRow,
      pawnCol
    );
    const selectorHeight = squareSize * 4;

    selector.style.top = `${
      this.isBoardFlipped
        ? visualRow === 7
          ? (visualRow + 1) * squareSize - selectorHeight
          : visualRow * squareSize
        : visualRow === 0
        ? visualRow * squareSize
        : (visualRow + 1) * squareSize - selectorHeight
    }px`;
    selector.style.left = `${visualCol * squareSize}px`;
    selector.style.width = `${squareSize}px`;
    selector.style.height = `${selectorHeight}px`;
  }

  reversePromotionPiecesIfNeeded(color) {
    const shouldReverse =
      (this.isBoardFlipped && color === "white") ||
      (!this.isBoardFlipped && color === "black");
    if (shouldReverse) {
      this.isReversed = !this.isReversed;
      return true;
    }
    return false;
  }

  calculateSelectorPosition(pawnRow, pawnCol) {
    const visualRow = this.isBoardFlipped ? 7 - pawnRow : pawnRow;
    const visualCol = this.isBoardFlipped ? 7 - pawnCol : pawnCol;
    return { visualRow, visualCol };
  }

  calculateSelectorSquares(endSquare, color) {
    const squares = [];
    let startRow = 0;

    startRow = color === "white" ? endSquare.getRow() : endSquare.getRow() - 3;

    for (let i = 0; i < 4; i++) {
      const row = startRow + i;
      const col = endSquare.getCol();
      squares.push({ row, col });
    }

    return squares;
  }

  removePromotionSelector() {
    this.activePromotionSelector?.selector.remove();
    this.activePromotionSelector = null;
    this.boardOverlay?.remove();
    this.boardOverlay = null;
    this.drawBoard();
  }

  updateSquareSize(squareSize) {
    this.squareSize = squareSize;
  }
}

export default PromotionSelector;
