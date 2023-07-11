for (let i = 0; i < 100; )
  document.getElementById("results").innerText +=
    ((++i % 3 ? "" : "fizz") + (i % 5 ? "" : "buzz") || i) + "\n";
