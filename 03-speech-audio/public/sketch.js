let catImg, input, button;
let responseText = '';
let sfxUrl = null;

async function setup() {
  createCanvas(400, 500);

  catImg = await loadImage('/api/cat');

  input = createInput('');
  button = createButton('send');
  button.mousePressed(sendMessage);
}

async function loadSfx() {
  const response = await fetch('/api/sfx');
  const blob = await response.blob();
  sfxUrl = URL.createObjectURL(blob);
}

function draw() {
  background(220);
  if (catImg) image(catImg, 0, 0, 400, 300);
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

  if (data.text) {
    if (!sfxUrl) await loadSfx();
    new Audio(sfxUrl).play();

    const audioResponse = await fetch('/api/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: data.text })
    });
    const audioBlob = await audioResponse.blob();
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audio.play();
  }
}
