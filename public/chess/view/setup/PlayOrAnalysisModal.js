import GameController from "../../controller/GameController.js";
import PlayerColor from "../../model/player/PlayerColor.js";
import GameSetup from "./GameSetup.js";

class PlayOrAnalysisModal {
  static COLOR_MAPPING = {
    white: PlayerColor.WHITE,
    black: PlayerColor.BLACK,
  };

  constructor() {
    this.gameSetup = new GameSetup();
    this.modal = document.getElementById("modal");

    this.isAnalysisGame = true;
    this.strengthLevel = 0;
    this.colorSelection = null;

    this.initializeModal();
    this.boundOutsideClickListener = this.outsideClickListener.bind(this);
  }

  initializeModal() {
    this.openModal();

    const analysisModeButton = document.getElementById("analysis-mode");
    const vsComputerModeButton = document.getElementById("vs-computer-mode");
    const colorSelectionContainer = document.getElementById(
      "color-choices-container"
    );
    const strengthLevelButtonsDiv = document.getElementById(
      "strength-level-buttons"
    );

    analysisModeButton.addEventListener("click", () => {
      this.handleSelection("analysis");
      analysisModeButton.classList.add("selected");
      vsComputerModeButton.classList.remove("selected");
    });

    vsComputerModeButton.addEventListener("click", () => {
      this.handleSelection("playVsComputer");
      vsComputerModeButton.classList.add("selected");
      analysisModeButton.classList.remove("selected");
    });

    colorSelectionContainer.addEventListener("click", (event) => {
      let button = event.target.closest(".color-choice");
      if (button) {
        const selectedColor = button.dataset.color;
        this.colorSelection =
          PlayOrAnalysisModal.COLOR_MAPPING[selectedColor] || selectedColor;
        colorSelectionContainer
          .querySelectorAll(".color-choice")
          .forEach((element) => {
            element.classList.remove("selected");
          });
        button.classList.add("selected");
      }
    });

    strengthLevelButtonsDiv.addEventListener("click", (event) => {
      if (event.target.matches(".strength-level")) {
        this.strengthLevel = event.target.dataset.strength;
        strengthLevelButtonsDiv
          .querySelectorAll(".strength-level")
          .forEach((element) => {
            element.classList.remove("selected");
          });
        event.target.classList.add("selected");
      }
    });
    document
      .getElementById("play-button")
      .addEventListener("click", () => this.handlePlayButtonClick());
    document
      .getElementById("close-button")
      .addEventListener("click", () => this.closeModal());
  }

  handleSelection(selection) {
    this.isAnalysisGame = selection === "analysis";
    this.toggleVisibility(selection);
    this.populateStrengthLevelsIfNeeded();
  }

  toggleVisibility(selection) {
    const toggle = (elementId, condition) => {
      const element = document.getElementById(elementId);
      if (elementId === "color-selection") {
        element.style.display = condition ? "flex" : "none";
      } else if (elementId === "stockfish-analysis") {
        element.style.display = condition ? "grid" : "none";
      } else {
        element.classList.toggle("hidden", !condition);
      }
    };

    toggle("strength-level-options", selection === "playVsComputer");
    toggle("color-selection", selection === "playVsComputer");
    toggle("stockfish-analysis", selection === "analysis");
    toggle("import-from-fen", selection === "analysis");
  }

  populateStrengthLevelsIfNeeded() {
    const strengthLevelButtonsDiv = document.getElementById(
      "strength-level-buttons"
    );
    if (
      !this.isAnalysisGame &&
      strengthLevelButtonsDiv.getElementsByClassName("strength-level")
        .length === 0
    ) {
      let buttonsHTML = "";
      for (let i = 1; i <= 8; i++) {
        buttonsHTML += `<button class="strength-level" data-strength="${i}" style="margin-right: ${
          i < 8 ? "5px" : "0"
        };">${i}</button>`;
      }
      strengthLevelButtonsDiv.innerHTML = buttonsHTML;
    }
  }

  handlePlayButtonClick() {
    let finalColorSelection = this.colorSelection;
    let isAnalysis = this.isAnalysisGame;

    if (this.colorSelection === "random") {
      finalColorSelection =
        Math.random() < 0.5 ? PlayerColor.WHITE : PlayerColor.BLACK;
    }

    const players = this.gameSetup.setupPlayers(
      isAnalysis,
      !isAnalysis,
      finalColorSelection
    );

    const gameController = new GameController(
      players.player1,
      players.player2,
      this.strengthLevel
    );
    this.closeModal();
    gameController.init();
  }

  setupOutsideClickListener() {
    document.addEventListener("click", this.boundOutsideClickListener);
  }

  outsideClickListener(event) {
    if (!this.modal.hasAttribute("open")) return;
    const modalContent = this.modal.querySelector("article");
    const isClickInside = modalContent.contains(event.target);

    if (!isClickInside) {
      this.handleSelection("analysis");
    }
  }

  removeOutsideClickListener() {
    document.removeEventListener("click", this.boundOutsideClickListener);
  }

  openModal() {
    this.modal.showModal();
    this.setupOutsideClickListener();
  }

  closeModal() {
    document.documentElement.classList.remove(
      "modal-is-open",
      "modal-is-opening"
    );
    document.documentElement.classList.add("modal-is-closing");
    this.removeOutsideClickListener();
    this.modal.close();
  }
}

export default PlayOrAnalysisModal;
