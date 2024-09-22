"use strict";

const vertexShaderSource = `
attribute vec4 a_position;
attribute vec2 a_texcoord;
uniform mat4 u_matrix;
varying vec2 v_texcoord;

void main() {
    gl_Position = u_matrix * a_position;
    v_texcoord = a_texcoord;
}
`;

const fragmentShaderSource = `
precision mediump float;
varying vec2 v_texcoord;
uniform sampler2D u_texture;

void main() {
    gl_FragColor = texture2D(u_texture, v_texcoord);
}
`;

function main() {
    var canvas = document.querySelector("#canvas");
    var gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    // Create shaders
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Setup GLSL program
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    var positionLocation = gl.getAttribLocation(program, "a_position");
    var texcoordLocation = gl.getAttribLocation(program, "a_texcoord");

    var matrixLocation = gl.getUniformLocation(program, "u_matrix");
    var textureLocation = gl.getUniformLocation(program, "u_texture");

    // Buffer for positions
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    setGeometry(gl);

    // Buffer for texture coordinates
    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    setTexcoords(gl);

    // Load textures
    var textures = [];
    var images = [
        "dadu1.jpg"
	];

    images.forEach(function(image) {
        var texture = gl.createTexture();
        textures.push(texture);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

        var img = new Image();
        img.src = image;
        img.crossOrigin = "";
        img.onload = function() {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

            if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
        };
    });

    var fieldOfViewRadians = degToRad(60);
    var modelXRotationRadians = 0;
    var modelYRotationRadians = 0;
    var then = 0;

    requestAnimationFrame(drawScene);

    function drawScene(time) {
        time *= 0.001;
        var deltaTime = time - then;
        then = time;

        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        modelYRotationRadians += deltaTime * 0.7;
        modelXRotationRadians += deltaTime * 0.4;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program);

        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(texcoordLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

        var cameraPosition = [0, 0, 2];
        var up = [0, 1, 0];
        var target = [0, 0, 0];
        var cameraMatrix = m4.lookAt(cameraPosition, target, up);
        var viewMatrix = m4.inverse(cameraMatrix);

        var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
        var matrix = m4.xRotate(viewProjectionMatrix, modelXRotationRadians);
        matrix = m4.yRotate(matrix, modelYRotationRadians);

        gl.uniformMatrix4fv(matrixLocation, false, matrix);
        gl.uniform1i(textureLocation, 0);

        textures.forEach(function(texture) {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
        });

        requestAnimationFrame(drawScene);
    }
}

function setGeometry(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            -0.5, -0.5,  -0.5,
			-0.5,  0.5,  -0.5,
			0.5, -0.5,  -0.5,
			-0.5,  0.5,  -0.5,
			0.5,  0.5,  -0.5,
			0.5, -0.5,  -0.5,

			-0.5, -0.5,   0.5,
			0.5, -0.5,   0.5,
			-0.5,  0.5,   0.5,
			-0.5,  0.5,   0.5,
			0.5, -0.5,   0.5,
			0.5,  0.5,   0.5,

			-0.5,   0.5, -0.5,
			-0.5,   0.5,  0.5,
			0.5,   0.5, -0.5,
			-0.5,   0.5,  0.5,
			0.5,   0.5,  0.5,
			0.5,   0.5, -0.5,

			-0.5,  -0.5, -0.5,
			0.5,  -0.5, -0.5,
			-0.5,  -0.5,  0.5,
			-0.5,  -0.5,  0.5,
			0.5,  -0.5, -0.5,
			0.5,  -0.5,  0.5,

			-0.5,  -0.5, -0.5,
			-0.5,  -0.5,  0.5,
			-0.5,   0.5, -0.5,
			-0.5,  -0.5,  0.5,
			-0.5,   0.5,  0.5,
			-0.5,   0.5, -0.5,

			0.5,  -0.5, -0.5,
			0.5,   0.5, -0.5,
			0.5,  -0.5,  0.5,
			0.5,  -0.5,  0.5,
			0.5,   0.5, -0.5,
			0.5,   0.5,  0.5,
        ]),
        gl.STATIC_DRAW);
}

function setTexcoords(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            // sisi depan
            0.0,  0.0,
            0.0,  1.0,
            1.0,  0.0,
            0.0,  1.0,
            1.0,  1.0,
            1.0,  0.0,

            // sisi belakang
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0,

            // sisi atas
            0.0,  0.0,
            0.0,  1.0,
            1.0,  0.0,
            0.0,  1.0,
            1.0,  1.0,
            1.0,  0.0,

            // sisi bawah
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0,

            // sisi kiri
            0.0,  0.0,
            0.0,  1.0,
            1.0,  0.0,
            0.0,  1.0,
            1.0,  1.0,
            1.0,  0.0,

            // sisi kanan
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0,
        ]),
        gl.STATIC_DRAW);
}


function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

function degToRad(d) {
    return d * Math.PI / 180;
}

main();
