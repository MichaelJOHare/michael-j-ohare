import ChessBoard from "../model/board/ChessBoard.js";
import EventHandlers from "../utils/EventHandlers.js";
import ImageLoader from "../utils/ImageLoader.js";
import ChessBoardHighlighter from "./ChessBoardHighlighter.js";
import PromotionSelector from "./PromotionSelector.js";

class ChessBoardPanel {
  static DRAG_DELTA = 6;
  static LIGHT_SQUARE_COLOR = "rgb(248 240 198)";
  static DARK_SQUARE_COLOR = "rgb(156 98 69)";
  static LIGHT_SQUARE_HIGHLIGHT_COLOR = "rgb(127 158 92)";
  static DARK_SQUARE_HIGHLIGHT_COLOR = "rgb(123 138 50)";
  static LIGHT_SQUARE_SELECTED_PIECE = "rgb(222 117 71)";
  static DARK_SQUARE_SELECTED_PIECE = "rgb(145 56 17)";
  static LIGHT_SQUARE_PREVIOUS_MOVE = "rgb(205 210 106)";
  static DARK_SQUARE_PREVIOUS_MOVE = "rgb(170 162 58)";

  constructor(board) {
    this.board = board;
    this.canvas = document.getElementById("chessboard");
    this.ctx = this.canvas.getContext("2d");
    this.boardContainer = document.getElementById("chessboard-container");
    this.offscreenCanvas = document.createElement("canvas");
    this.offscreenCanvas.width = this.canvas.width;
    this.offscreenCanvas.height = this.canvas.height;
    this.offscreenCtx = this.offscreenCanvas.getContext("2d");

    this.imageLoader = new ImageLoader();
    this.promotionSelector = new PromotionSelector(
      this.drawBoard.bind(this),
      this.boardContainer,
      this.imageLoader
    );

    this.isBoardFlipped = false;
    this.squareSize = 0;
    this.svgSquareSize = 0;
    this.setScreen = this.setScreen.bind(this);
    this.eventListeners = [];

    this.boardHighlighter = new ChessBoardHighlighter(
      this.board,
      this.ctx,
      this.offscreenCanvas,
      this.offscreenCtx,
      this.imageLoader
    );
    this.imageLoader.loadPieceImages().then(() => {
      this.setScreen();
    });
  }

  init(guiController) {
    this.guiController = guiController;
    this.eventHandlers = new EventHandlers(
      this.clearHighlights.bind(this),
      this.clearSquareOnCanvas.bind(this),
      this.drawGhostPieceOnCanvas.bind(this),
      this.guiController,
      this.imageLoader,
      this.canvas,
      this.board,
      this.boardHighlighter
    );
    this.setupEventListeners();
  }

  drawBoard() {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const drawRow = this.isBoardFlipped ? 7 - row : row;
        const drawCol = this.isBoardFlipped ? 7 - col : col;

        this.offscreenCtx.fillStyle =
          (drawRow + drawCol) % 2 === 0
            ? ChessBoardPanel.LIGHT_SQUARE_COLOR
            : ChessBoardPanel.DARK_SQUARE_COLOR;
        this.offscreenCtx.fillRect(
          drawCol * this.squareSize,
          drawRow * this.squareSize,
          this.squareSize,
          this.squareSize
        );
        if (drawRow === 7 || drawCol === 7) {
          this.boardHighlighter.drawRankFileLabels(drawRow, drawCol);
        }
      }
    }

    this.drawPieces();
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);

    if (this.boardHighlighter.previousMove) {
      this.boardHighlighter.drawPreviousMoveHighlightedSquares(
        this.boardHighlighter.previousMove
      );
    }
    if (this.boardHighlighter.listOfMovesToHighlight.length > 0) {
      this.boardHighlighter.drawHighlightedSquares(
        this.boardHighlighter.listOfMovesToHighlight
      );
    }
    if (this.boardHighlighter.kingCheckHighlightedSquare) {
      this.boardHighlighter.drawKingCheckHighlight();
    }
  }

  drawPieces() {
    for (let row = 0; row < ChessBoard.ROW_LENGTH; row++) {
      for (let col = 0; col < ChessBoard.COLUMN_LENGTH; col++) {
        const piece = this.board.getPieceAt(row, col);
        if (piece && !this.shouldSkipDrawingPiece(row, col)) {
          const image = this.imageLoader.getPieceImage(piece);
          if (image) {
            const drawRow = this.isBoardFlipped ? 7 - row : row;
            const drawCol = this.isBoardFlipped ? 7 - col : col;

            this.offscreenCtx.drawImage(
              image,
              drawCol * this.squareSize,
              drawRow * this.squareSize,
              this.squareSize * 0.96,
              this.squareSize * 0.96
            );
          }
        }
      }
    }
  }

  drawGhostPieceOnCanvas(piece, x, y) {
    const image = this.imageLoader.getPieceImage(piece);
    if (image) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.5;
      this.ctx.drawImage(
        image,
        x,
        y,
        this.squareSize * 0.96,
        this.squareSize * 0.96
      );
      this.ctx.restore();
    }
  }

  shouldSkipDrawingPiece(row, col) {
    if (this.promotionSelector.activePromotionSelector) {
      const { startSquare, endSquare, selectorSquares } =
        this.promotionSelector.activePromotionSelector;
      if (
        (startSquare.getRow() === row && startSquare.getCol() === col) ||
        (endSquare.getRow() === row && endSquare.getCol() === col) ||
        selectorSquares.some((sq) => sq.row === row && sq.col === col)
      ) {
        return true;
      }
    }
    return false;
  }

  showPromotionSelector(move, callback) {
    this.clearPreviousMoveHighlights();
    this.promotionSelector.createPromotionSelector(move, callback);
  }

  drawHighlightedSquares(moves) {
    this.boardHighlighter.listOfMovesToHighlight = moves;
  }

  drawPreviousMoveHighlightedSquares(move) {
    this.boardHighlighter.previousMove = move;
  }

  drawKingCheckHighlightedSquare(square) {
    const row = square.getRow();
    const col = square.getCol();
    this.boardHighlighter.kingCheckHighlightedSquare = { row, col };
  }

  drawTemporaryAnalysisArrow(fromSquare, toSquare) {
    this.boardHighlighter.drawTemporaryAnalysisArrow(fromSquare, toSquare);
  }

  drawBestMoveAnalysisArrow(fromSquare, toSquare) {
    this.boardHighlighter.addAnalysisArrow(fromSquare, toSquare);
  }

  clearBestMoveArrow() {
    this.boardHighlighter.clearBestMoveArrow();
  }

  clearHighlights() {
    this.boardHighlighter.clearHighlights();
  }

  clearPreviousMoveHighlights() {
    this.boardHighlighter.clearPreviousMoveHighlights();
  }

  clearKingCheckHighlightedSquare(square) {
    if (!square) {
      this.boardHighlighter.kingCheckHighlightedSquare = null;
      return;
    }
    const row = this.isBoardFlipped ? 7 - square.getRow() : square.getRow();
    const col = this.isBoardFlipped ? 7 - square.getCol() : square.getCol();
    this.boardHighlighter.redrawSquare(row, col);
    this.boardHighlighter.kingCheckHighlightedSquare = null;
  }

  clearSquareOnCanvas(row, col) {
    const x = row * this.squareSize;
    const y = col * this.squareSize;
    this.ctx.clearRect(x, y, this.squareSize, this.squareSize);
    this.ctx.fillStyle =
      (row + col) % 2 === 0
        ? ChessBoardPanel.LIGHT_SQUARE_SELECTED_PIECE
        : ChessBoardPanel.DARK_SQUARE_SELECTED_PIECE;
    this.ctx.fillRect(
      row * this.squareSize,
      col * this.squareSize,
      this.squareSize,
      this.squareSize
    );
  }

  setScreen() {
    let dpi = window.devicePixelRatio || 1;

    const size = Math.min(
      this.boardContainer.offsetWidth,
      this.boardContainer.offsetHeight
    );

    this.canvas.width = size * dpi;
    this.canvas.height = size * dpi;
    this.offscreenCanvas.width = size * dpi;
    this.offscreenCanvas.height = size * dpi;

    this.canvas.style.width = size + "px";
    this.canvas.style.height = size + "px";
    this.offscreenCanvas.style.width = size + "px";
    this.offscreenCanvas.style.height = size + "px";

    this.squareSize = (size * dpi) / 8;
    this.svgSquareSize = size / 8;

    this.updateSquareSize();
    this.reorderSidebarBasedOnScreenWidth();
    this.updatePromotionSelector();
    this.boardHighlighter.updatePersistentElements();
  }

  updatePromotionSelector() {
    if (this.promotionSelector.activePromotionSelector) {
      this.promotionSelector.updatePromotionSelector();
    }
  }

  cancelPromotionSelector(action) {
    this.promotionSelector.removePromotionSelector();
    this.guiController.handleCancelPromotion(action);
  }

  onPreviousMoveButtonClick() {
    this.cancelPromotionSelector("undo");
    this.guiController.handlePreviousMoveButtonClick();
  }

  onNextMoveButtonClick() {
    this.cancelPromotionSelector("redo");
    this.guiController.handleNextMoveButtonClick();
  }

  onImportFromFENButtonClick() {
    this.toggleFENInput();
  }

  toggleFENInput() {
    const fenImportContainer = document.getElementById("fen-import-container");
    fenImportContainer.style.display =
      fenImportContainer.style.display === "none" ? "block" : "none";
  }

  onSubmitFENButtonClick() {
    const fenInput = document.getElementById("fen-input");
    const fenString = fenInput.value;
    if (fenString) {
      this.guiController.handleFENImport(fenString);
    }
    fenInput.value = "";
    this.toggleFENInput();
  }

  writeCurrentFENString(fenString) {
    const fenBox = document.getElementById("fen-box");
    fenBox.value = fenString;
  }

  reorderSidebarBasedOnScreenWidth() {
    const screenWidth = window.innerWidth;
    const chessboardWrapper = document.querySelector(".chessboard-wrapper");
    const sidebar = document.getElementById("sidebar");
    const textAreasContainer = document.getElementById("text-areas-container");

    const isSidebarInside = sidebar.parentNode === chessboardWrapper;

    if (screenWidth <= 1010 && !isSidebarInside) {
      chessboardWrapper.insertBefore(sidebar, textAreasContainer);
    } else if (screenWidth > 1010 && isSidebarInside) {
      document.getElementById("game-container").appendChild(sidebar);
    }
  }

  toggleBoardFlip() {
    this.isBoardFlipped = !this.isBoardFlipped;
    this.boardHighlighter.isBoardFlipped = this.isBoardFlipped;
    this.eventHandlers.isBoardFlipped = this.isBoardFlipped;
    this.promotionSelector.isBoardFlipped = this.isBoardFlipped;
    this.promotionSelector.flipPromotionSelector();
    this.boardHighlighter.updatePersistentElements();
    this.drawBoard();
  }

  setupEventListeners() {
    this.addEventListener(
      this.canvas,
      "mousedown",
      this.eventHandlers.onMouseDown
    );
    this.addEventListener(
      this.canvas,
      "mousemove",
      this.eventHandlers.onMouseMove
    );
    this.addEventListener(this.canvas, "mouseup", this.eventHandlers.onMouseUp);

    this.addEventListener(
      this.canvas,
      "touchstart",
      this.eventHandlers.onTouchStart
    );
    this.addEventListener(
      this.canvas,
      "touchmove",
      this.eventHandlers.onTouchMove
    );
    this.addEventListener(
      this.canvas,
      "touchend",
      this.eventHandlers.onTouchEnd
    );

    this.addEventListener(this.canvas, "contextmenu", (event) =>
      event.preventDefault()
    );

    this.addEventListener(document.getElementById("prev-move"), "click", () =>
      this.onPreviousMoveButtonClick()
    );
    this.addEventListener(document.getElementById("next-move"), "click", () =>
      this.onNextMoveButtonClick()
    );
    this.addEventListener(
      document.getElementById("import-from-fen"),
      "click",
      () => this.onImportFromFENButtonClick()
    );
    this.addEventListener(document.getElementById("flip-board"), "click", () =>
      this.toggleBoardFlip()
    );
    this.addEventListener(document.getElementById("submit-fen"), "click", () =>
      this.onSubmitFENButtonClick()
    );

    this.addEventListener(
      document.getElementById("sf-NNUE-analysis-checkbox"),
      "change",
      (event) => {
        const isChecked = event.target.checked;
        this.guiController.toggleAnalysis(isChecked, "NNUE");
        document.getElementById("sf-classical-analysis-checkbox").checked =
          !isChecked;
      }
    );

    this.addEventListener(
      document.getElementById("sf-classical-analysis-checkbox"),
      "change",
      (event) => {
        const isChecked = event.target.checked;
        this.guiController.toggleAnalysis(isChecked, "Classical");
        document.getElementById("sf-NNUE-analysis-checkbox").checked =
          !isChecked;
      }
    );

    if (screen.orientation) {
      this.addEventListener(screen.orientation, "change", this.setScreen);
    }
    this.addEventListener(window, "resize", this.debounce(this.setScreen, 50));
  }

  updateSquareSize() {
    this.squareSize = this.canvas.width / 8;
    if (this.boardHighlighter) {
      this.boardHighlighter.updateSquareSize(this.squareSize);
      this.boardHighlighter.updateSVGSquareSize(this.svgSquareSize);
    }
    if (this.eventHandlers) {
      this.eventHandlers.updateSquareSize(this.squareSize, this.svgSquareSize);
    }
    if (this.promotionSelector) {
      this.promotionSelector.updateUnscaledSquareSize(this.svgSquareSize);
    }
    this.drawBoard();
  }

  addEventListener(target, type, listener, options) {
    target.addEventListener(type, listener, options);
    this.eventListeners.push({ target, type, listener });
  }

  removeAllEventListeners() {
    this.eventListeners.forEach(({ target, type, listener }) => {
      target.removeEventListener(type, listener);
    });
    this.eventListeners = [];
  }

  cleanup() {
    this.removeAllEventListeners();
    document.getElementById("sf-NNUE-analysis-checkbox").checked = false;
    document.getElementById("sf-classical-analysis-checkbox").checked = false;
  }

  debounce(func, wait, immediate) {
    let timeout;
    return function () {
      const context = this,
        args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
}

export default ChessBoardPanel;
