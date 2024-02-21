import PlayOrAnalysisModal from "./view/setup/PlayOrAnalysisModal.js";

const playOrAnalysisModal = new PlayOrAnalysisModal();

/*
TO DO:
 - Show current depth/sf advantage in analysis mode
  - centipawn eval in place of sf analysis title when under 1010px width

 - Implement captured pieces/material advantage
      
 - Make draw arrow only snap to possible legal moves

 - Refactor private fields/methods vs public ones (large scale. sfController as model)

 - Make move piece with click a smooth glide to location
      - Add sounds
 
 - Implement PGN box

  - Once finished with everything, maybe think about splitting up into custom elements or maybe even turning this into a react app
*/
