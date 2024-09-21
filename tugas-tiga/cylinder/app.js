var img;
var theta = 0;

function preload() {
  img = loadImage('peta-dunia-1.webp');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
  background(255, 255, 255, 255);

  rotateZ(theta * mouseX * 0.001);
  rotateX(theta * mouseX * 0.001);
  rotateY(theta * mouseX * 0.001);

  //pass image as texture
  texture(img);
  sphere(200);

  theta += 0.05;
}