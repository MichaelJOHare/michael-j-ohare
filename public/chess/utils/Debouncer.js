class Debouncer {
  constructor(delay) {
    this.delay = delay;
    this.timeoutId = null;
  }

  debounce(func) {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(func, this.delay);
  }
}

export default Debouncer;
