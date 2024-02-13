import FENGenerator from "../utils/FENGenerator.js";

class StockfishController {
  constructor(board, move, gameState, gui) {
    this.board = board;
    this.move = move;
    this.gameState = gameState;
    this.gui = gui;
    this.stockfish = new Worker("/chess/stockfish/stockfish-nnue-16-single.js");
    this.stockfish.onmessage = this.handleStockfishMessage.bind(this);
    this.isAnalysisEnabled = false;

    this.lastArrowUpdate = Date.now();
    this.lastDepthUpdated = 0;
    this.updateInterval = 3000;
    this.depthInterval = 5;

    this.initEngine();
  }

  initEngine() {
    this.sendCommand("uci");
  }

  sendCommand(command) {
    this.stockfish.postMessage(command);
  }

  handleStockfishMessage(event) {
    console.log("Stockfish says: ", event.data);

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
          this.updateArrow(moveData[1]);
          this.lastDepthUpdated = depth;
          this.lastArrowUpdate = currentTime;
        }
      }
    }

    if (event.data.startsWith("bestmove")) {
      const bestMove = event.data.split(" ")[1];
      this.updateArrow(bestMove);
      this.lastDepthUpdated = 0;
      this.lastArrowUpdate = Date.now();
    }
  }

  updateArrow(bestMove) {
    const fromSquare = bestMove.substring(0, 2);
    const toSquare = bestMove.substring(2, 4);
    this.notifyUIAboutBestMove(fromSquare, toSquare);
  }

  notifyUIAboutBestMove(fromSquare, toSquare) {
    const from = this.convertNotationToSquare(fromSquare);
    const to = this.convertNotationToSquare(toSquare);

    this.gui.handleAnalysisArrow(from, to);
  }

  toggleContinuousAnalysis(enable) {
    this.isAnalysisEnabled = enable;
    if (enable) {
      this.sendCommand("ucinewgame");
      this.sendCommand("isready");
      const fen = FENGenerator.toFEN(this.board, this.move, this.gameState);
      this.getMove(fen);
    } else {
      this.cleanUp();
    }
  }

  getMove(fen) {
    this.sendCommand(`position fen ${fen}`);
    this.sendCommand("go movetime 2000");
  }

  convertNotationToSquare(notation) {
    const col = notation.charCodeAt(0) - "a".charCodeAt(0);
    const row = 8 - parseInt(notation[1]);

    return { row, col };
  }

  cleanUp() {
    this.sendCommand("stop");
    this.stockfish.terminate();
  }
}

export default StockfishController;
