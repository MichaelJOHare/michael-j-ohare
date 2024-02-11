class HeroSection extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <div class="hero" data-theme="dark">
      <nav class="container-fluid">
        <ul>
          <li>
            <a href="/public/" class="contrast"><strong>Home</strong></a>
          </li>
        </ul>
        <ul>
          <li>
            <details role="list" dir="rtl">
              <summary aria-haspopup="listbox" role="link" class="contrast">
                Website Theme
              </summary>
              <ul role="listbox">
                <li><a href="#" data-theme-switcher="auto">Auto</a></li>
                <li><a href="#" data-theme-switcher="light">Light</a></li>
                <li><a href="#" data-theme-switcher="dark">Dark</a></li>
              </ul>
            </details>
          </li>
          <li>
            <details role="list" dir="rtl">
              <summary aria-haspopup="listbox" role="link" class="contrast">
                Past Side Projects
              </summary>
              <ul role="listbox">
                <li>
                  <a href="./chess/">Chess Game</a>
                </li>
                <li><a href="./Dino Game/">Dino Game</a></li>
                <li><a href="./Cube/">Cube</a></li>
                <li>
                  <a href="./Fizz/">FizzBuzz Interview Question</a>
                </li>
                <li>
                  <a href="https://github.com/MichaelJOHare/number-guess-game"
                    >Number Guessing Game</a
                  >
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </nav>
      <header class="container">
        <hgroup>
          <h1>Michael J O'Hare</h1>
          <h2>Full Stack Developer</h2>
        </hgroup>
        <p>
          <a href="Resume/Michael_O'Hare_Resume.pdf" role="button">Resume</a>
        </p>
      </header>
    </div>
    `;
  }
}
customElements.define("hero-section", HeroSection);
