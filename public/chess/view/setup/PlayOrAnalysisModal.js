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

    document
      .getElementById("vs-computer-mode")
      .addEventListener("click", () => this.handleSelection("playVsComputer"));
    document
      .getElementById("analysis-mode")
      .addEventListener("click", () => this.handleSelection("analysis"));

    document.querySelectorAll(".color-choice").forEach((element) => {
      element.addEventListener("click", (event) => {
        let button = event.target.closest(".color-choice");
        let selectedColor = button.dataset.color;
        this.colorSelection =
          PlayOrAnalysisModal.COLOR_MAPPING[selectedColor] || selectedColor;
      });
    });

    document.getElementById("play-button").addEventListener("click", () => {
      this.handlePlayButtonClick();
    });

    document.getElementById("close-button").addEventListener("click", () => {
      this.closeModal();
    });
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
      for (let i = 1; i <= 8; i++) {
        let button = document.createElement("button");
        if (i < 8) {
          button.style.marginRight = "5px";
        }
        button.classList.add("strength-level");
        button.setAttribute("data-strength", i);
        button.textContent = `${i}`;
        button.addEventListener("click", (event) => {
          this.strengthLevel = event.target.dataset.strength;
        });
        strengthLevelButtonsDiv.appendChild(button);
      }
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
