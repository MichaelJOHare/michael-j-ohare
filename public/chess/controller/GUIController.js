import ChessBoardPanel from "../view/ChessBoardPanel.js";
import GameLogPanel from "../view/GameLogPanel.js";

class GUIController {
  constructor(board, moveHistory, gameController) {
    this.chessBoardPanel = new ChessBoardPanel(board);
    this.gameLogPanel = new GameLogPanel(moveHistory, this);
    this.chessBoardPanel.init(this);
    this.gameController = gameController;
  }

  handleSquareClick(row, col) {
    this.gameController.handleClickToMove(row, col);
  }

  handleDragStart(row, col) {
    this.gameController.handleDragStart(row, col);
  }

  handleDragDrop(row, col) {
    this.gameController.handleDragDrop(row, col);
  }

  handlePreviousMoveButtonClick() {
    this.gameController.handlePreviousMoveButtonClick();
  }

  handleSingleUndo() {
    this.gameController.handleSingleUndo();
  }

  handleNextMoveButtonClick() {
    this.gameController.handleNextMoveButtonClick();
  }

  handleSingleRedo() {
    this.gameController.handleSingleRedo();
  }

  writeCurrentFENString() {
    const currentFENString = this.gameController.generateCurrentFEN();
    this.chessBoardPanel.writeCurrentFENString(currentFENString);
  }

  handleFENImport(fenString) {
    this.gameController.initiateGameFromFEN(fenString);
  }

  handlePawnPromotion(move, callback) {
    this.chessBoardPanel.showPromotionSelector(move, callback);
    this.chessBoardPanel.drawBoard();
  }

  handleCancelPromotion(action) {
    this.gameController.handleCancelPromotion(action);
  }

  hidePromotionSelector(action) {
    this.chessBoardPanel.cancelPromotionSelector(action);
  }

  setHighlightedSquares(moves) {
    this.chessBoardPanel.drawHighlightedSquares(moves);
  }

  setHighlightedSquaresPreviousMove(move) {
    this.chessBoardPanel.clearPreviousMoveHighlights();
    this.chessBoardPanel.drawPreviousMoveHighlightedSquares(move);
  }

  setKingCheckHighlightedSquare(square) {
    this.chessBoardPanel.drawKingCheckHighlightedSquare(square);
  }

  clearHighlightedSquares() {
    this.chessBoardPanel.clearHighlights();
    this.chessBoardPanel.clearPreviousMoveHighlights();
    this.chessBoardPanel.clearKingCheckHighlightedSquare(null);
  }

  clearKingCheckHighlightedSquare(square) {
    this.chessBoardPanel.clearKingCheckHighlightedSquare(square);
  }

  drawBoard() {
    this.chessBoardPanel.drawBoard();
  }

  toggleBoardFlip() {
    this.chessBoardPanel.toggleBoardFlip();
  }

  setStockfishBoardFlipped(isFlipped) {
    this.gameController.setStockfishBoardFlipped(isFlipped);
  }

  handleAnalysisArrow(fromSquare, toSquare) {
    this.chessBoardPanel.drawTemporaryAnalysisArrow(fromSquare, toSquare);
  }

  handleBestMoveArrow(fromSquare, toSquare) {
    this.chessBoardPanel.drawBestMoveAnalysisArrow(fromSquare, toSquare);
  }

  clearBestMoveArrow() {
    this.chessBoardPanel.clearBestMoveArrow();
  }

  toggleAnalysis(enabled, analysisType) {
    this.gameController.toggleAnalysis(enabled, analysisType);
  }

  clearGameLog() {
    this.gameLogPanel.clearGameLog();
  }

  updateGUI() {
    this.writeCurrentFENString();
    this.gameLogPanel.updateGameLog();
    this.chessBoardPanel.drawBoard();
  }

  cleanup() {
    this.gameLogPanel.cleanup();
    this.chessBoardPanel.cleanup();
  }
}

export default GUIController;
