import FENGenerator from "../utils/FENGenerator.js";
import Debouncer from "../utils/Debouncer.js";

class StockfishController {
  constructor(board, move, gameState, gui) {
    this.board = board;
    this.move = move;
    this.gameState = gameState;
    this.gui = gui;

    this.stockfish = new Worker("/chess/stockfish/stockfish-nnue-16.js");
    this.debouncer = new Debouncer(300);
    this.stockfish.onmessage = this.handleStockfishMessage.bind(this);
    this.isAnalysisEnabled = false;

    this.lastArrowUpdate = Date.now();
    this.lastDepthUpdated = 0;
    this.updateInterval = 3000;
    this.depthInterval = 5;

    this.positionHash;
    this.bestMove;

    this.initEngine();
  }

  initEngine() {
    this.sendCommand("uci");
  }

  sendCommand(command) {
    if (["position", "go"].some((cmd) => command.startsWith(cmd))) {
      this.stopCurrentAnalysis();
    }
    this.stockfish.postMessage(command);
  }

  handleStockfishMessage(event) {
    if (event.data.startsWith("info depth")) {
      const depth = parseInt(event.data.split(" ")[2]);
      const currentTime = Date.now();
      if (
        depth === 1 ||
        (depth - this.lastDepthUpdated >= this.depthInterval &&
          currentTime - this.lastArrowUpdate >= this.updateInterval)
      ) {
        const moveData = event.data.match(/pv (\w{2}\w{2})/);
        if (moveData) {
          this.updateTemporaryAnalysisArrow(moveData[1]);
          this.lastDepthUpdated = depth;
          this.lastArrowUpdate = currentTime;
        }
      }
    }

    if (event.data.startsWith("bestmove")) {
      const bestMove = event.data.split(" ")[1];
      this.bestMove = bestMove;
      this.addBestMoveAnalysisArrow(bestMove);
      this.lastDepthUpdated = 0;
      this.lastArrowUpdate = Date.now();
    }
  }

  toggleContinuousAnalysis(enable) {
    this.isAnalysisEnabled = enable;
    if (enable) {
      this.sendCommand("setoption name Use NNUE value true");
      this.sendCommand("ucinewgame");
      this.sendCommand("isready");
      this.requestAnalysisIfNeeded();
    } else {
      this.cleanUp();
    }
  }

  getMove(fen) {
    this.sendCommand(`position fen ${fen}`);
    this.sendCommand("go depth 20");
  }

  requestAnalysisIfNeeded() {
    const newPositionHash = this.calculatePositionHash();
    if (this.isAnalysisEnabled && newPositionHash !== this.positionHash) {
      this.stopCurrentAnalysis();
      this.positionHash = newPositionHash;
      this.debouncer.debounce(() => this.getMove(newPositionHash));
    } else if (this.bestMove) {
      this.addBestMoveAnalysisArrow(this.bestMove);
    }
  }

  updateTemporaryAnalysisArrow(moveData) {
    const fromSquare = moveData.substring(0, 2);
    const toSquare = moveData.substring(2, 4);
    this.addTemporaryAnalysisArrow(fromSquare, toSquare);
  }

  addTemporaryAnalysisArrow(fromSquare, toSquare) {
    const from = this.convertNotationToSquare(fromSquare);
    const to = this.convertNotationToSquare(toSquare);

    this.gui.handleAnalysisArrow(from, to);
  }

  addBestMoveAnalysisArrow(bestMove) {
    const fromSquare = bestMove.substring(0, 2);
    const toSquare = bestMove.substring(2, 4);

    const from = this.convertNotationToSquare(fromSquare);
    const to = this.convertNotationToSquare(toSquare);

    this.gui.handleBestMoveArrow(from, to);
  }

  calculatePositionHash() {
    return FENGenerator.toFEN(this.board, this.move, this.gameState);
  }

  convertNotationToSquare(notation) {
    const col = notation.charCodeAt(0) - "a".charCodeAt(0);
    const row = 8 - parseInt(notation[1]);

    return { row, col };
  }

  clearBestMoveArrow() {
    this.gui.clearBestMoveArrow();
    this.bestMove = null;
  }

  stopCurrentAnalysis() {
    this.stockfish.postMessage("stop");
  }

  cleanUp() {
    this.sendCommand("stop");
    this.clearBestMoveArrow();
  }
}

export default StockfishController;
