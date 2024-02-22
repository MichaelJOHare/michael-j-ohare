import PlayOrAnalysisModal from "./view/setup/PlayOrAnalysisModal.js";

const playOrAnalysisModal = new PlayOrAnalysisModal();

/*
TO DO:
  - FIX - toggle off one analysis auto toggles on the other (!IMPORTANT! make sure both are never on at the same time)

  - shift sf analysis switches to right and add centipawn eval when in analysis toggled on
      - fix depth progress bar under 1010px width
      - find way to add 20px width height to chessboard container when in analysis mode but analysis toggled off

 - Implement captured pieces/material advantage
      
 - Make draw arrow only snap to possible legal moves

 - Refactor private fields/methods vs public ones (large scale. sfController as model)

 - Make move piece with click a smooth glide to location
      - Add sounds

 - Test if importtGameFromFEN resets state properly
 
 - Implement PGN box

  - Once finished with everything, maybe think about splitting HTML into custom elements or maybe even turning this into a react app
*/
