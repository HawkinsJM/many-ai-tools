let generatedImg, input, button, generateButton;
let responseText = '';

function setup() {
  createCanvas(400, 500);

  generateButton = createButton('generate image');
  generateButton.mousePressed(generateImage);

  input = createInput('');
  button = createButton('send');
  button.mousePressed(sendMessage);
}

async function generateImage() {
  responseText = 'generating image...';
  generatedImg = await loadImage('/api/generate-image');
  responseText = '';
}

function draw() {
  background(220);
  if (generatedImg) image(generatedImg, 0, 0, 400, 300);
  text(responseText, 10, 310, 380, 180);
}

async function sendMessage() {
  responseText = 'thinking...';
  const response = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: input.value() })
  });
  const data = await response.json();
  responseText = data.error ?? data.text;
}
