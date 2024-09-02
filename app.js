const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
  alert('WebGL tidak didukung oleh browser Anda.');
}

const vertexShaderSource = `
  attribute vec2 aPosition;

  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

//shader fragment
const fragmentShaderSource = `
  precision mediump float;

  void main() {
    gl_FragColor = vec4(0.0, 0.8, 1.0, 1.0); // Warna cyan
  }
`;

//membuat dan mengompilasi shader
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  //cek error kompilasi
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Kesalahan saat mengompilasi shader:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

// Fungsi untuk membuat program shader
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // Cek kesalahan linking
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Kesalahan saat linking program:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

// bikin shader
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

// Membuat program shader
const program = createProgram(gl, vertexShader, fragmentShader);

// Mendefinisikan data posisi untuk segitiga
const positions = [
  0.0,  0.5,  // Titik atas
 -0.5, -0.5,  // Titik kiri bawah
  0.5, -0.5   // Titik kanan bawah
];

// Membuat buffer dan mengikat data posisi
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// Mengaktifkan atribut posisi
const positionAttributeLocation = gl.getAttribLocation(program, 'aPosition');
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(
  positionAttributeLocation,
  2,          // Jumlah komponen per atribut (x dan y)
  gl.FLOAT,   // Tipe data
  false,      // Normalisasi
  0,          // Stride
  0           // Offset
);

// Mengatur ukuran viewport dan membersihkan canvas
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.0, 0.0, 0.0, 1.0); // Latar belakang hitam
gl.clear(gl.COLOR_BUFFER_BIT);

// Menggunakan program shader dan menggambar segitiga
gl.useProgram(program);
gl.drawArrays(gl.TRIANGLES, 0, 3);
