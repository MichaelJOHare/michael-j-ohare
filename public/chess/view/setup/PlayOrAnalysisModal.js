import GameController from "../../controller/GameController.js";
import PlayerColor from "../../model/player/PlayerColor.js";
import GameSetup from "./GameSetup.js";

class PlayOrAnalysisModal {
  static COLOR_MAPPING = {
    white: PlayerColor.WHITE,
    black: PlayerColor.BLACK,
  };

  constructor() {
    this.modal = document.getElementById("modal");
    this.gameSetup = new GameSetup();

    this.gameController = null;
    this.players = null;
    this.isAnalysisGame = true;
    this.strengthLevel = 0;
    this.colorSelection = null;

    this.initializeModal();
  }

  initializeModal() {
    this.openModal();

    document.addEventListener("click", this.handleOutsideClick);
    this.analysisModeButton.addEventListener(
      "click",
      this.handleAnalysisModeClick
    );
    this.vsComputerModeButton.addEventListener(
      "click",
      this.handleVsComputerModeClick
    );
    this.colorSelectionContainer.addEventListener(
      "click",
      this.handleColorSelectionClick
    );
    this.strengthLevelButtonsDiv.addEventListener(
      "click",
      this.handleStrengthLevelClick
    );
    this.playButton.addEventListener("click", this.handlePlayButtonClick);
    this.closeButton.addEventListener("click", this.handleCloseButtonClick);
    this.resetBoardButton.addEventListener(
      "click",
      this.handleResetBoardButtonClick
    );
  }

  openModal() {
    document.documentElement.classList.remove("modal-is-closing");
    document.documentElement.classList.add("modal-is-opening");
    this.modal.showModal();
    document.documentElement.classList.add("modal-is-open");
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

  toggleSelected(element, isSelected) {
    element.classList.toggle("selected", isSelected);
  }

  populateStrengthLevelsIfNeeded() {
    if (
      !this.isAnalysisGame &&
      this.strengthLevelButtonsDiv.getElementsByClassName("strength-level")
        .length === 0
    ) {
      let buttonsHTML = "";
      for (let i = 1; i <= 8; i++) {
        buttonsHTML += `<button class="strength-level" data-strength="${i}" style="margin-right: ${
          i < 8 ? "5px" : "0"
        };">${i}</button>`;
      }
      this.strengthLevelButtonsDiv.innerHTML = buttonsHTML;
    }
  }

  handleAnalysisModeClick = () => {
    this.handleSelection("analysis");
    this.toggleSelected(this.analysisModeButton, true);
    this.toggleSelected(this.vsComputerModeButton, false);
    this.modalButtons.style.removeProperty("justify-content");
  };

  handleVsComputerModeClick = () => {
    this.handleSelection("playVsComputer");
    this.toggleSelected(this.vsComputerModeButton, true);
    this.toggleSelected(this.analysisModeButton, false);
    this.modalButtons.style.justifyContent = "center";
  };

  handleColorSelectionClick = (event) => {
    let button = event.target.closest(".color-choice");
    if (button) {
      const selectedColor = button.dataset.color;
      this.colorSelection =
        PlayOrAnalysisModal.COLOR_MAPPING[selectedColor] || selectedColor;
      this.colorSelectionContainer
        .querySelectorAll(".color-choice")
        .forEach((element) => {
          this.toggleSelected(element, false);
        });
      this.toggleSelected(button, true);
    }
  };

  handleStrengthLevelClick = (event) => {
    if (event.target.matches(".strength-level")) {
      this.strengthLevel = event.target.dataset.strength;
      this.strengthLevelButtonsDiv
        .querySelectorAll(".strength-level")
        .forEach((element) => {
          this.toggleSelected(element, false);
        });
      this.toggleSelected(event.target, true);
    }
  };

  handlePlayButtonClick = () => {
    let finalColorSelection = this.colorSelection;
    let isAnalysis = this.isAnalysisGame;

    if (this.colorSelection === "random") {
      finalColorSelection =
        Math.random() < 0.5 ? PlayerColor.WHITE : PlayerColor.BLACK;
    }

    this.players = this.gameSetup.setupPlayers(
      isAnalysis,
      !isAnalysis,
      finalColorSelection
    );

    this.gameController = new GameController(
      this.players.player1,
      this.players.player2,
      this.strengthLevel
    );
    this.removeModalEventListeners();
    this.closeModal();
    this.gameController.init();
  };

  handleCloseButtonClick = () => {
    this.handleSelection("analysis");
    this.handlePlayButtonClick();
  };

  handleResetBoardButtonClick = (event) => {
    event.stopPropagation();
    this.gameController.toggleAnalysis(false, "NNUE");
    this.gameController.toggleAnalysis(false, "Classical");
    this.resetBoardButton.removeEventListener(
      "click",
      this.handleResetBoardButtonClick
    );
    this.gameController.hidePromotionSelector("reset");
    this.gameController = null;
    this.players = null;
    this.isAnalysisGame = true;
    this.strengthLevel = 0;
    this.colorSelection = null;
    this.initializeModal();
  };

  handleOutsideClick = (event) => {
    if (!this.modal.hasAttribute("open")) return;
    const modalContent = this.modal.querySelector("article");
    const isClickInside = modalContent.contains(event.target);

    if (!isClickInside) {
      this.handleSelection("analysis");
      this.handlePlayButtonClick();
    }
  };

  removeModalEventListeners() {
    this.analysisModeButton.removeEventListener(
      "click",
      this.handleAnalysisModeClick
    );
    this.vsComputerModeButton.removeEventListener(
      "click",
      this.handleVsComputerModeClick
    );
    this.colorSelectionContainer.removeEventListener(
      "click",
      this.handleColorSelectionClick
    );
    this.strengthLevelButtonsDiv.removeEventListener(
      "click",
      this.handleStrengthLevelClick
    );
    this.playButton.removeEventListener("click", this.handlePlayButtonClick);
    this.closeButton.removeEventListener("click", this.handleCloseButtonClick);
  }

  removeOutsideClickListener() {
    document.removeEventListener("click", this.handleOutsideClick);
  }

  get modalContent() {
    return document.getElementById("modal-content");
  }

  get analysisModeButton() {
    return document.getElementById("analysis-mode");
  }

  get vsComputerModeButton() {
    return document.getElementById("vs-computer-mode");
  }

  get modalButtons() {
    return document.getElementById("modal-buttons");
  }

  get colorSelectionContainer() {
    return document.getElementById("color-choices-container");
  }

  get strengthLevelButtonsDiv() {
    return document.getElementById("strength-level-buttons");
  }

  get playButton() {
    return document.getElementById("play-button");
  }

  get closeButton() {
    return document.getElementById("close-button");
  }

  get resetBoardButton() {
    return document.getElementById("reset-board");
  }
}

export default PlayOrAnalysisModal;
