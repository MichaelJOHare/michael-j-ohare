class StockfishController {
  constructor() {
    this.stockfish = new Worker(
      "./chess/stockfish/stockfish-nnue-16-single.js"
    );
    this.stockfish.onmessage = this.handleStockfishMessage.bind(this);

    this.initEngine();
  }

  initEngine() {
    this.sendCommand("uci");
  }

  handleStockfishMessage(event) {
    console.log("Stockfish says: ", event.data);
  }

  sendCommand(command) {
    this.stockfish.postMessage(command);
  }

  getMove(fen) {
    this.sendCommand(`position fen ${fen}`);
    this.sendCommand("go movetime 2000");
  }
}

export default StockfishController;
