let cylinders = [];

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
  background(255);
  ambientLight(100, 100, 100);
  pointLight(255, 255, 255, 200, 300, 100);

  rotateY(millis() / 1000);

  let angleIncrement = TWO_PI / 30; // Number of vertices in the cylinder
  let radius = 50;
  let height = 200;

  for (let i = 0; i < 10; i++) { // Create 10 cylinders
    let cylinderVertices = [];
    for (let j = 0; j <= 30; j++) { // Detail of the cylinder
      let angle = j * angleIncrement;
      let x = cos(angle) * radius;
      let z = sin(angle) * radius;

      // Extrude every nth vertex outside
      let extrusionAmount = 0.3;
      if (j % 5 === 0) {
        x += extrusionAmount;
      }

      let yTop = -height / 2;
      let yBottom = height / 2;

      cylinderVertices.push(createVector(x, yTop, z));
      cylinderVertices.push(createVector(x, yBottom, z));
    }
    cylinders.push(cylinderVertices);
  }

  for (let i = 0; i < cylinders.length; i++) {
    beginShape(TRIANGLE_STRIP);
    for (let j = 0; j < cylinders[i].length; j++) {
      vertex(cylinders[i][j].x, cylinders[i][j].y, cylinders[i][j].z);
    }
    endShape();
  }
}
