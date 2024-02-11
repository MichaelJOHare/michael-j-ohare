const PieceWithMoveStatus = (Base) =>
  class extends Base {
    constructor(...args) {
      super(...args);
      this.hasMoved = false;
    }

    setHasMoved(hasMoved) {
      this.hasMoved = hasMoved;
    }

    getHasMoved() {
      return this.hasMoved;
    }
  };

export default PieceWithMoveStatus;
