class PromotionSelector {
  constructor(drawBoardCallback, boardContainer, imageLoader) {
    this.drawBoard = drawBoardCallback;
    this.boardContainer = boardContainer;
    this.imageLoader = imageLoader;
    this.isBoardFlipped = false;
    this.isReversed = false;
    this.squareSize = 0;

    this.activePromotionSelector = null;
  }

  createPromotionSelector(move, callback, squareSize) {
    let promotionPieces = ["Queen", "Rook", "Bishop", "Knight"];
    const pawnPosition = move.getEndSquare();
    const pawnRow = pawnPosition.getRow();
    const pawnCol = pawnPosition.getCol();
    const visualRow = this.isBoardFlipped ? 7 - pawnRow : pawnRow;
    const visualCol = this.isBoardFlipped ? 7 - pawnCol : pawnCol;
    const color = move.piece.getPlayer().getColor().toLowerCase();
    const colorCapitalized = color.charAt(0).toUpperCase() + color.slice(1);
    const selector = document.createElement("div");
    const selectorHeight = this.squareSize * promotionPieces.length;
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

    if (this.isBoardFlipped && color === "white") {
      promotionPieces = promotionPieces.reverse();
      this.isReversed = !this.isReversed;
    }

    if (!this.isBoardFlipped && color === "black") {
      promotionPieces = promotionPieces.reverse();
    }

    if (this.isBoardFlipped) {
      if (visualRow === 7) {
        selector.style.top = `${
          (visualRow + 1) * this.squareSize - selectorHeight
        }px`;
      } else {
        selector.style.top = `${visualRow * this.squareSize}px`;
      }
    } else {
      if (visualRow === 0) {
        selector.style.top = `${visualRow * this.squareSize}px`;
      } else {
        selector.style.top = `${
          (visualRow + 1) * this.squareSize - selectorHeight
        }px`;
      }
    }

    selector.style.left = `${visualCol * squareSize}px`;
    selector.style.width = `${squareSize}px`;
    selector.style.height = `${squareSize * promotionPieces.length}px`;
    selector.style.zIndex = "3";
    selector.style.padding = "0";
    selector.style.margin = "0";
    selector.style.lineHeight = "0";
    selector.style.boxSizing = "border-box";

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
        img.addEventListener("click", () => {
          callback(type.toUpperCase());
          boardOverlay.remove();
          this.removePromotionSelector();
        });
        selector.appendChild(img);
      }
    });

    this.boardContainer.appendChild(selector);
  }

  setPositionAndSizeOfSelector() {
    const { selector, move } = this.activePromotionSelector;
    const pawnPosition = move.getEndSquare();
    const pawnRow = pawnPosition.getRow();
    const pawnCol = pawnPosition.getCol();
    const visualRow = this.isBoardFlipped ? 7 - pawnRow : pawnRow;
    const visualCol = this.isBoardFlipped ? 7 - pawnCol : pawnCol;
    const selectorHeight = this.squareSize * 4;

    if (this.isBoardFlipped) {
      if (visualRow === 7) {
        selector.style.top = `${
          (visualRow + 1) * this.squareSize - selectorHeight
        }px`;
      } else {
        selector.style.top = `${visualRow * this.squareSize}px`;
      }
    } else {
      if (visualRow === 0) {
        selector.style.top = `${visualRow * this.squareSize}px`;
      } else {
        selector.style.top = `${
          (visualRow + 1) * this.squareSize - selectorHeight
        }px`;
      }
    }

    selector.style.left = `${visualCol * this.squareSize}px`;
    selector.style.width = `${this.squareSize}px`;
    selector.style.height = `${selectorHeight}px`;

    Array.from(selector.children).forEach((img) => {
      img.style.height = `${this.squareSize}px`;
    });
  }

  updatePromotionSelector() {
    if (this.activePromotionSelector) {
      this.setPositionAndSizeOfSelector();
    }
  }

  flipPromotionSelector() {
    if (this.activePromotionSelector) {
      this.setPositionAndSizeOfSelector();
      const { selector, move } = this.activePromotionSelector;
      const color = move.piece.getPlayer().getColor().toLowerCase();
      const shouldReverse =
        (this.isBoardFlipped && color === "white" && !this.isReversed) ||
        (!this.isBoardFlipped && color === "black" && this.isReversed) ||
        (!this.isBoardFlipped && color === "white" && this.isReversed) ||
        (this.isBoardFlipped && color === "black" && !this.isReversed);

      if (shouldReverse) {
        const childrenArray = Array.from(selector.children);
        childrenArray.reverse().forEach((child) => selector.appendChild(child));
        this.isReversed = !this.isReversed;
      }
    }
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
    if (this.activePromotionSelector) {
      this.activePromotionSelector.selector.remove();
      this.activePromotionSelector = null;

      this.drawBoard();
    }
  }

  updateSquareSize(squareSize) {
    this.squareSize = squareSize;
  }
}

export default PromotionSelector;
