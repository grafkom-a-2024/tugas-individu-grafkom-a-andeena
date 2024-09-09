// Mendapatkan canvas dan context WebGL
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
    alert("WebGL tidak didukung di browser ini");
}

// Mendefinisikan shader vertex
const vertexShaderSource = `
    attribute vec2 a_position;
    uniform vec2 u_resolution;
    uniform mat3 u_matrix;
    void main() {
        // Terapkan matriks transformasi
        vec2 position = (u_matrix * vec3(a_position, 1)).xy;

        // Mengkonversi posisi dari pixel ke clipspace
        vec2 zeroToOne = position / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;

        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1); // flip Y axis
    }
`;

// Mendefinisikan shader fragment
const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 u_color;
    void main() {
        gl_FragColor = u_color;
    }
`;

// Membuat shader
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Membuat program WebGL
function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

// Membuat dan meng-compile shader
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

// Mendapatkan lokasi atribut dan uniform
const positionLocation = gl.getAttribLocation(program, "a_position");
const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
const colorLocation = gl.getUniformLocation(program, "u_color");
const matrixLocation = gl.getUniformLocation(program, "u_matrix");

// Membuat buffer posisi untuk segitiga
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
setRectangle(gl, 0, 0, 100, 30);

// Fungsi untuk membuat matriks translasi
function translationMatrix(tx, ty) {
    return [
        1, 0, 0,
        0, 1, 0,
        tx, ty, 1,
    ];
}

// Fungsi untuk membuat matriks rotasi
function rotationMatrix(angleInRadians) {
    const cos = Math.cos(angleInRadians);
    const sin = Math.sin(angleInRadians);
    return [
        cos, -sin, 0,
        sin, cos, 0,
        0, 0, 1,
    ];
}

// Fungsi untuk menggabungkan matriks
function multiplyMatrices(a, b) {
    const a00 = a[0 * 3 + 0];
    const a01 = a[0 * 3 + 1];
    const a02 = a[0 * 3 + 2];
    const a10 = a[1 * 3 + 0];
    const a11 = a[1 * 3 + 1];
    const a12 = a[1 * 3 + 2];
    const a20 = a[2 * 3 + 0];
    const a21 = a[2 * 3 + 1];
    const a22 = a[2 * 3 + 2];

    const b00 = b[0 * 3 + 0];
    const b01 = b[0 * 3 + 1];
    const b02 = b[0 * 3 + 2];
    const b10 = b[1 * 3 + 0];
    const b11 = b[1 * 3 + 1];
    const b12 = b[1 * 3 + 2];
    const b20 = b[2 * 3 + 0];
    const b21 = b[2 * 3 + 1];
    const b22 = b[2 * 3 + 2];

    return [
        a00 * b00 + a01 * b10 + a02 * b20,
        a00 * b01 + a01 * b11 + a02 * b21,
        a00 * b02 + a01 * b12 + a02 * b22,

        a10 * b00 + a11 * b10 + a12 * b20,
        a10 * b01 + a11 * b11 + a12 * b21,
        a10 * b02 + a11 * b12 + a12 * b22,

        a20 * b00 + a21 * b10 + a22 * b20,
        a20 * b01 + a21 * b11 + a22 * b21,
        a20 * b02 + a21 * b12 + a22 * b22,
    ];
}

// Variabel untuk menyimpan translasi dan rotasi
let translation = [0, 0];
let angleInRadians = 0;
const rotationSpeed = 0.05;
const translationSpeed = 10;

// Fungsi untuk menggambar frame per frame
function drawScene() {
    // Resize canvas jika diperlukan
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas dengan warna hitam
    gl.clearColor(0, 0, 0, 1);  // Set warna background canvas menjadi hitam
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Gunakan program dan aktifkan atribut posisi
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tentukan posisi data buffer
    const size = 2;          // 2 komponen per iterasi
    const type = gl.FLOAT;   // data bertipe float 32 bit
    const normalize = false; // jangan normalkan data
    const stride = 0;        // pindah ke data berikutnya setiap iterasi
    const offset = 0;        // mulai dari awal buffer
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

    // Set resolusi
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // Set warna acak untuk persegi panjang
    gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);

    // Buat matriks transformasi
    let matrix = translationMatrix(translation[0], translation[1]);
    matrix = multiplyMatrices(matrix, rotationMatrix(angleInRadians));

    // Kirim matriks ke shader
    gl.uniformMatrix3fv(matrixLocation, false, matrix);

    // Gambar objek (rectangle menggunakan TRIANGLES)
    const primitiveType = gl.TRIANGLES;
    const count = 6; // 6 titik (2 segitiga)
    gl.drawArrays(primitiveType, offset, count);
}

// Fungsi untuk membuat persegi panjang (2 segitiga)
function setRectangle(gl, x, y, width, height) {
    const x1 = x;
    const y1 = y;
    const x2 = x + width;
    const y2 = y + height;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,
    ]), gl.STATIC_DRAW);
}

// Fungsi untuk menangani input keyboard
window.addEventListener('keydown', function(event) {
    switch (event.key) {
        case 'ArrowLeft':
            translation[0] -= translationSpeed;
            break;
        case 'ArrowRight':
            translation[0] += translationSpeed;
            break;
        case 'ArrowUp':
            translation[1] -= translationSpeed;
            break;
        case 'ArrowDown':
            translation[1] += translationSpeed;
            break;
        case 'r':
            angleInRadians += rotationSpeed;
            break;
    }
    drawScene();  // panggil kembali fungsi drawScene setelah update translasi atau rotasi
});

// Mulai animasi pertama
drawScene();
