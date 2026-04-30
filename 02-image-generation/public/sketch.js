let generatedImg, input, button;
let responseText = "";

function setup() {
  createCanvas(400, 500);

  const generateButton = createButton("start");
  generateButton.mousePressed(async () => {
    generateButton.remove();
    responseText = "generating...";
    const data = await fetch("/api/generate").then(r => r.json());
    generatedImg = await loadImage("data:image/png;base64," + data.image);
    responseText = "";
  });

  createButton("What do you want out of life?").mousePressed(() => sendMessage("What do you want out of life?"));
  createButton("Tell me more about that please").mousePressed(() => sendMessage("Tell me more about that please"));

  createElement("br");
  input = createInput("");
  button = createButton("send");
  button.mousePressed(() => sendMessage(input.value()));
  input.elt.addEventListener("keydown", e => { if (e.key === "Enter") sendMessage(input.value()); });
}

function draw() {
  background(220);
  if (generatedImg) image(generatedImg, 0, 0, 400, 300);
  text(responseText, 10, 310, 380, 180);
}

async function sendMessage(message) {
  responseText = "thinking...";
  const response = await fetch("/api/transform", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  const data = await response.json();
  if (data.error) {
    responseText = data.error;
    return;
  }
  responseText = data.text;
  generatedImg = await loadImage("data:image/png;base64," + data.image);
}
