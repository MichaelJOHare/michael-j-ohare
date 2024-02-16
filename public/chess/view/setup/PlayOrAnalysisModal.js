import GameController from "../../controller/GameController.js";

class PlayOrAnalysisModal {
  constructor() {
    this.modal = document.getElementById("modal");
    this.selectionMade = false;
    this.initializeModal();
    this.setupOutsideClickListener();
  }

  initializeModal() {
    document.getElementById("vsComputerMode").addEventListener("click", () => {
      this.handleSelection("playVsComputer");
    });

    // maybe not needed? (one or other?)
    document.getElementById("analysisMode").addEventListener("click", () => {
      this.handleSelection("analysis");
    });
  }

  handleSelection(selection) {
    this.selectionMade = true;
    this.modal.close();

    console.log(selection);
    if (selection === "playVsComputer") {
      document.getElementById("strengthLevelOptions").style.display = "block";
      document.getElementById("colorSelection").style.display = "block";
      document.getElementById("playButton").style.display = "block";
      // once play selected ->
      // const gameController = new GameController();
      // setup players for play vs computer
    } else {
      // maybe not needed? (one or other?)
      console.log("default to analysis mode");
      const gameController = new GameController();
      // no FEN import/sf analysis
    }
  }

  setupOutsideClickListener() {
    document.addEventListener("click", (event) => {
      if (!this.modal.hasAttribute("open")) return;
      const modalContent = this.modal.querySelector("article");
      const isClickInside = modalContent.contains(event.target);

      if (!isClickInside) {
        this.handleSelection("analysis");
      }
    });
  }

  showModal() {
    this.modal.showModal();
  }

  closeModal() {
    this.modal.close();
    document.documentElement.classList.remove(
      "modal-is-open",
      "modal-is-opening"
    );
    document.documentElement.classList.add("modal-is-closing");
  }
}

export default PlayOrAnalysisModal;
