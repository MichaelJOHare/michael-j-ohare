export default class ImageLoader {
  constructor() {
    this.pieceImages = {};
  }

  loadPieceImages() {
    const pieceTypes = ["Pawn", "Rook", "Knight", "Bishop", "Queen", "King"];
    const pieceColors = ["White", "Black"];
    const imageLoadingPromises = [];

    pieceColors.forEach((color) => {
      pieceTypes.forEach((type) => {
        const imageName = `${color}_${type}`;
        const imagePath = `./images/${imageName}.svg`;
        const imageLoadPromise = new Promise((resolve) => {
          this.pieceImages[imageName] = new Image();
          this.pieceImages[imageName].onload = resolve;
          this.pieceImages[imageName].src = imagePath;
        });
        imageLoadingPromises.push(imageLoadPromise);
      });
    });

    return Promise.all(imageLoadingPromises);
  }

  getPieceImage(piece) {
    const imageName = this.getPieceImageName(piece);
    return this.pieceImages[imageName];
  }

  getPieceImageName(piece) {
    if (!piece) {
      return;
    }
    const color = piece.getPlayer().getColor().toLowerCase();
    const colorCapitalized = color.charAt(0).toUpperCase() + color.slice(1);

    const type = piece.getType().toLowerCase();
    const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);

    return `${colorCapitalized}_${typeCapitalized}`;
  }
}
