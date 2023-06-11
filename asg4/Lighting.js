/* 
 * FJ Tria (@fjstria)
 * CSE160/asg4/Lighting.js
 */

// ----- VERTEX SHADER -----
var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;
    attribute vec4 a_Position;

    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_VertPos;

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    uniform bool u_normalOn;
    uniform mat4 u_NormalMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        if (u_normalOn) {
            v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
        }
        else {
            v_Normal = a_Normal;
        }
        v_VertPos = u_ModelMatrix * a_Position;
    }`

// ----- FRAGMENT SHADER -----
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_VertPos;

    uniform vec3 u_lightpos;
    uniform vec3 u_cameraPos;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform sampler2D u_Sampler3;
    uniform sampler2D u_Sampler4;
    uniform int u_whichTexture;
    uniform bool u_lightOn;
    uniform vec3 u_lightColor;

    void main() {
        if (u_whichTexture == -3) {
            gl_FragColor = vec4((v_Normal + 1.0)/2.0, 1.0);
        }
        else if (u_whichTexture == -2) {
            gl_FragColor = u_FragColor;
        }
        else if (u_whichTexture == -1) {
            gl_FragColor = vec4(v_UV,1.0,1.0);
        }
        else if (u_whichTexture == 0) { 
            gl_FragColor = texture2D(u_Sampler0, v_UV);
        }
        else if (u_whichTexture == 1) {
            gl_FragColor = texture2D(u_Sampler1, v_UV);
        }
        else if (u_whichTexture == 2) {
            gl_FragColor = texture2D(u_Sampler2, v_UV);
        }
        else if (u_whichTexture == 3) {
            gl_FragColor = texture2D(u_Sampler3, v_UV);
        }
        else {
            gl_FragColor = vec4(1,.2,.2,1);
        }

        vec3 lightVector = u_lightpos - vec3(v_VertPos);
        float r=length(lightVector);
        vec3 L = normalize(lightVector);
        vec3 N = normalize(v_Normal);
        float nDotL = max(dot(N,L), 0.0);
        vec3 R = reflect(L, N);
        vec3 E = normalize(u_cameraPos-vec3(v_VertPos));
        float specular = pow(max(dot(E,R), 0.0),30.0);
        vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
        vec3 ambient = vec3(gl_FragColor) * 0.3;

        if (u_lightOn) {
            if (u_whichTexture == 0) {
                gl_FragColor = vec4(diffuse+ambient, 1.0);
            }
            else {
                gl_FragColor = vec4(specular * u_lightColor + diffuse * u_lightColor + ambient, gl_FragColor.a);
            }
        }
    }`

// ----- GLOBAL VARIABLES -----
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

let a_UV;
let a_Normal;
let u_ViewMatrix;
let u_ProjectionMatrix;

let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_whichTexture;

let u_lightOn;
let u_lightpos;
let u_cameraPos;
let u_lightColor;
let u_normalOn;

// ----- SETUP -----
function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
}

// ----- CONVERT COORDINATES -----
function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return ([x, y]);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_lightpos = gl.getUniformLocation(gl.program, 'u_lightpos');
    if (!u_lightpos) {
      console.log('Failed to get the storage location of u_lightpos');
      return;
    }
  
    u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
    if (!u_lightColor) {
      console.log('Failed to get the storage location of u_lightColor');
      return;
    }
  
    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
      console.log('Failed to get the storage location of u_cameraPos');
      return;
    }
  
    u_normalOn = gl.getUniformLocation(gl.program, 'u_normalOn');
    if (!u_normalOn) {
      console.log('Failed to get the storage location of u_normalOn');
      return;
    }

    // Get the storage location of u_Modelmatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_Modelmatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_NormalMatrix) {
      console.log('Failed to get the storage location of u_NormalMatrix');
      return;
    }

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('bruh');
        console.log('Failed to get the storage location of a_UV');
        return;
    } 

    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
      console.log('Failed to get the storage location of a_Normal');
      return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get u_ViewMatrix');
        return;
    } 

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get u_ProjectionMatrix');
        return;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get u_whichTexture');
        return;
    }

    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_lightOn) {
      console.log('Failed to get u_lightOn');
      return;
    }

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0'); //sky
    if (!u_Sampler0) {
        console.log('Failed to get u_Sampler0');
        return false;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1'); //grass
    if (!u_Sampler1) {
        console.log('Failed to get u_Sampler1');
        return false;
    }

    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
        console.log('Failed to get u_Sampler2');
        return false;
    }

    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    if (!u_Sampler3) {
        console.log('Failed to get u_Sampler3');
        return false;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// ----- TEXTURES -----
function initTextures() {
    var image0 = new Image();
    if (!image0) {
        console.log('Failed to get image0');
        return false;
    }
    image0.onload = function () { sendImageToTEXTURE0(image0); };
    image0.crossOrigin = "anonymous";
    image0.src = 'sky.png';
  
    var image1 = new Image();
    if (!image1) {
        console.log('Failed to get image1');
        return false;
    }
    image1.onload = function () { sendImageToTEXTURE1(image1); };
    image1.crossOrigin = "anonymous";
    image1.src = 'mycelium.png';
  
    var image2 = new Image();
    if (!image2) {
        console.log('Failed to get image2');
        return false;
    }
    image2.onload = function () { sendImageToTEXTURE2(image2); };
    image2.crossOrigin = "anonymous";
    image2.src = 'mushroom.png';
}

function sendImageToTEXTURE0(image0) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to get texture0');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image0);
    gl.uniform1i(u_Sampler0, 0);
}
  
function sendImageToTEXTURE1(image1) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to get texture1');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image1);
    gl.uniform1i(u_Sampler1, 1);
}
  
function sendImageToTEXTURE2(image2) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to get texture1');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image2);
    gl.uniform1i(u_Sampler2, 2);
}

// ----- CONSTANTS -----
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const PIC = 3;

// ----- UI GLOBAL VARIABLES -----
let g_AngleX = 0;
let g_camSlider = -180;
let g_AngleY = 0;

let g_frontLeft = 0;
let g_frontRight = 0;
let g_backLeft = 0;
let g_backRight = 0;
let g_base = 0;
let g_middle = 0;
let g_tip = 0;
let g_animate = false;
let shift_key = false;
let g_stem = 0;
let g_shroom = 0;
var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;
var g_camera;
let g_lightpos = [0, 1, -2];
let g_lightOn = false;
let g_lightColor = [1.0, 1.0, 1.0];
let g_normalOn = false;
let g_aniLight = true;

function addActionForHtmlUI() {
    // ----- SLIDERS -----
    document.getElementById('angleSlide').addEventListener('mousemove', function () { g_camSlider = this.value; renderScene(); });

    document.getElementById('lightX').addEventListener('mousemove', function (ev) { if (ev.buttons == 1) { g_lightpos[0] = this.value / 100; renderScene(); } })
    document.getElementById('lightY').addEventListener('mousemove', function (ev) { if (ev.buttons == 1) { g_lightpos[1] = this.value / 100; renderScene(); } })
    document.getElementById('lightZ').addEventListener('mousemove', function (ev) { if (ev.buttons == 1) { g_lightpos[2] = this.value / 100; renderScene(); } })
    document.getElementById('bSlide').addEventListener('mousemove', function () { g_lightColor[2] = this.value / 10; });

    // ----- BUTTONS -----
    document.getElementById('on').addEventListener('click', function () { g_animate = true; });
    document.getElementById('off').addEventListener('click', function () { g_animate = false; });
    document.getElementById('normal_on').addEventListener('click', function () { g_normalOn = true; });
    document.getElementById('normal_off').addEventListener('click', function () { g_normalOn = false; });
    document.getElementById('light_on').addEventListener('click', function () { g_lightOn = true; });
    document.getElementById('light_off').addEventListener('click', function () { g_lightOn = false; });
    document.getElementById('Lon').addEventListener('click', function () { g_aniLight = true; });
    document.getElementById('Loff').addEventListener('click', function () { g_aniLight = false; });
}

// ----- MAIN -----
var xyCoord = [0,0];
function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionForHtmlUI();
    canvas.onmousedown = click;
    canvas.onmousemove = function (ev) { 
        if (ev.buttons == 1) { 
            click(ev, 1) 
        }
        else {
            if (xyCoord[0] != 0){
                xyCoord = [0,0];
            }
        }
    }
    g_camera = new Camera();
    document.onkeydown = keydown;
    initTextures();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    requestAnimationFrame(tick);
}

function scroll(ev) {
    if (ev.deltaY > 0) {
        g_camera.forward(1);
    }
    else {
        g_camera.back(1);
    }
}

function click(ev){
    // make rotation on y and x axis
    let [x, y] = convertCoordinatesEventToGL(ev);
    if (xyCoord[0] == 0) {
        xyCoord = [x, y];
    }
    g_AngleX += xyCoord[0] - x;
    g_AngleY += xyCoord[1] - y;
    if (Math.abs(g_AngleX / 360) > 1) {
        g_AngleX = 0;
    }
    if (Math.abs(g_AngleY / 360) > 1) {
        g_AngleY = 0;
    }
}

// ----- TICK -----
let time = 0;
function tick() {
    g_seconds = performance.now() / 1000.0 - g_startTime;
    updateAnimationAngles();
    renderScene();
    requestAnimationFrame(tick);
}

// ----- UPDATE ANIMATION ANGLES -----
function updateAnimationAngles() {
    if (g_animate) {
        //legs
        g_frontLeft = (25 * Math.sin(g_seconds));
        g_frontRight = (25 * Math.sin(g_seconds));
        g_backLeft = (10 * Math.sin(g_seconds));
        g_backRight = (10 * Math.sin(g_seconds));
        //tail
        g_base = (2 * Math.sin(g_seconds));
    }
    if (g_aniLight) {
        g_lightpos = [2 * Math.cos(-1 * g_seconds), 1.2, 2 * Math.sin(-1 * g_seconds)];
    }
}

// ----- KEYDOWN -----
function keydown(ev) {
    if (ev.keyCode == 68) {
        g_camera.eye.elements[0] += 0.2;
    }
    else if (ev.keyCode == 65) {
        g_camera.eye.elements[0] -= 0.2;
    }
    else if (ev.keyCode == 87) {
        g_camera.forward();
    }
    else if (ev.keyCode == 83) {
        g_camera.back();
    }
    else if (ev.keyCode == 81) {
        g_camera.panLeft();
    }
    else if (ev.keyCode == 69) {
        g_camera.panRight();
    }
    renderScene();
}

// ----- DRAWING CUBES -----
var g_map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 0, 0, 2, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 3, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 0, 0, 2, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
  
function drawMap() {
    for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
            if (g_map[x][y] == 1) {
                var body = new Cube();
                if (g_normalOn) {
                    body.textureNum = -3;
                }
                else {
                    body.textureNum = 1;
                }
                body.matrix.translate(x - 4, -.75, y - 4);
                body.normalMatrix.setInverseOf(body.matrix).transpose();
                body.renderfaster();
            }
            else if (g_map[x][y] == 2) {
                var body = new Cube();
                if (g_normalOn) {
                    body.textureNum = -3;
                } 
                else {
                    body.textureNum = 1;
                }
                body.matrix.translate(x - 3.5, -.9, y - 4);
                body.normalMatrix.setInverseOf(body.matrix).transpose();
                body.render();
            }
            else if (g_map[x][y] == 3) {
                var body = new Cube();
                if (g_normalOn) {
                    body.textureNum = -3;
                }
                else {
                    body.textureNum = 2;
                }
                body.matrix.translate(x - 3.5, -.3, y - 4);
                body.normalMatrix.setInverseOf(body.matrix).transpose();
                body.render();
            }
        }
    }
}

// ----- RENDER -----
var g_eye = [0, 0, 3];
var g_at = [0, 0, -100];
var g_up = [0, 1, 0];

function renderScene() {
    var startTime = performance.now();

    var projMat = new Matrix4();
    projMat.setPerspective(50, canvas.width / canvas.height, .1, 1000);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    // Pass the view matrix
    var viewMat = new Matrix4();
    viewMat.setLookAt(
        g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
        g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
        g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var globalRotMat = new Matrix4().rotate(g_AngleX, 0, -1, 0);
    globalRotMat.rotate(g_camSlider, 0, 1, 0);
    globalRotMat.rotate(g_AngleY, -1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // ----- LIGHTING -----
    gl.uniform3f(u_lightpos, g_lightpos[0], g_lightpos[1], g_lightpos[2]);
    gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);
    gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
    gl.uniform1i(u_lightOn, g_lightOn);
    gl.uniform1i(u_normalOn, g_normalOn);
  
    var lightS = new Cube();
    lightS.color = [g_lightColor[0], g_lightColor[1], g_lightColor[2], 1.0];
    lightS.matrix.translate(g_lightpos[0], g_lightpos[1], g_lightpos[2]);
    lightS.matrix.scale(-0.1, -0.1, -0.1);
    lightS.matrix.translate(-0.5, -.5, -.5);
    lightS.render();

    // ----- COLORS -----
    var RED = [0.65, 0.13, 0.10, 1.0];
    var OFFWHITE = [0.69, 0.69, 0.69, 1.0];
    var GRAY = [0.47, 0.47, 0.47, 1.0];
    var TAN = [0.58, 0.56, 0.38, 1.0];
    var BLACK = [0, 0, 0, 1];

    // ----- FLOOR -----
    var floor = new Cube();
    if (g_normalOn) {
        floor.textureNum = -3;
    }
    else {
        floor.textureNum = 1;
    }
    floor.matrix.translate(0, -0.525, 0);
    floor.matrix.scale(10, 0, 10);
    floor.matrix.translate(-.5, 0, -.5);
    floor.render();

    // ----- SKY -----
    var sky = new Cube();
    sky.color = [0, 1, 1, 1];
    if (g_normalOn) {
        sky.textureNum = -3;
    }
    else {
        sky.textureNum = 0;
    }
    sky.matrix.scale(50, 50, 50);
    sky.matrix.translate(-.5, -.5, -.5);
    sky.render();

    // ----- SPHERE -----
    var sphere = new Sphere();
    sphere.matrix.translate(-0.75, 0.75, -.3);
    sphere.matrix.scale(.5, .5, .5);
    if (g_normalOn) {
        sphere.textureNum = -3;
    } else {
        sphere.textureNum = 1;
    }
    sphere.normalMatrix.setInverseOf(sphere.matrix).transpose();
    sphere.render();

    // ----- BLOCKY ANIMAL -----
    // BODY 
    var body = new Cube();
    body.color = RED;
    if (g_normalOn) {
        body.textureNum = -3;
    }
    else {
        body.textureNum = -2;
    }
    body.matrix.scale(0.6, 0.5, 0.9);
    body.matrix.translate(-0.5, 0, -0.5);
    body.normalMatrix.setInverseOf(body.matrix).transpose();
    body.render();

    // HEAD
    var head = new Cube();
    head.color = RED;
    if (g_normalOn) {
        head.textureNum = -3;
    }
    else {
        head.textureNum = -2;
    }
    head.matrix.scale(0.4, 0.4, 0.4);
    head.matrix.translate(-0.5, 0.5, -2.125);
    head.normalMatrix.setInverseOf(head.matrix).transpose();
    head.render();

    var face = new Cube();
    face.color = OFFWHITE;
    if (g_normalOn) {
        face.textureNum = -3;
    }
    else {
        face.textureNum = -2;
    }
    face.matrix.scale(0.3, 0.2, 0.05);
    face.matrix.translate(-0.5, 1, -17.25);
    face.normalMatrix.setInverseOf(face.matrix).transpose();
    face.render();

    var nose = new Cube();
    nose.color = GRAY;
    if (g_normalOn) {
        nose.textureNum = -3;
    }
    else {
        nose.textureNum = -2;
    }
    nose.matrix.scale(0.2, 0.1, 0.05);
    nose.matrix.translate(-0.5, 2, -17.5);
    nose.normalMatrix.setInverseOf(nose.matrix).transpose();
    nose.render();

    var leftNostril = new Cube();
    leftNostril.color = BLACK;
    if (g_normalOn) {
        leftNostril.textureNum = -3;
    }
    else {
        leftNostril.textureNum = -2;
    }
    leftNostril.matrix.scale(0.0499, 0.0499, 0.05);
    leftNostril.matrix.translate(-2, 5, -17.75);
    leftNostril.normalMatrix.setInverseOf(leftNostril.matrix).transpose();
    leftNostril.render();

    var rightNostril = new Cube();
    rightNostril.color = BLACK;
    if (g_normalOn) {
        rightNostril.textureNum = -3;
    }
    else {
        rightNostril.textureNum = -2;
    }
    rightNostril.matrix.scale(0.0499, 0.0499, 0.05);
    rightNostril.matrix.translate(1, 5, -17.75);
    rightNostril.normalMatrix.setInverseOf(rightNostril.matrix).transpose();
    rightNostril.render();

    var leftEye = new Cube();
    leftEye.color = BLACK;
    if (g_normalOn) {
        leftEye.textureNum = -3;
    }
    else {
        leftEye.textureNum = -2;
    }
    leftEye.matrix.scale(0.099, 0.099, 0.05);
    leftEye.matrix.translate(-2, 3.5, -17.5);
    leftEye.normalMatrix.setInverseOf(leftEye.matrix).transpose();
    leftEye.render();

    var rightEye = new Cube();
    rightEye.color = BLACK;
    if (g_normalOn) {
        rightEye.textureNum = -3;
    }
    else {
        rightEye.textureNum = -2;
    }
    rightEye.matrix.scale(0.099, 0.099, 0.05);
    rightEye.matrix.translate(1, 3.5, -17.5);
    rightEye.normalMatrix.setInverseOf(rightEye.matrix).transpose();
    rightEye.render();

    var leftHorn = new Cube();
    leftHorn.color = GRAY;
    if (g_normalOn) {
        leftHorn.textureNum = -3;
    }
    else {
        leftHorn.textureNum = -2;
    }
    leftHorn.matrix.scale(0.05, 0.15, 0.05);
    leftHorn.matrix.translate(-5, 3.3, -15);
    leftHorn.normalMatrix.setInverseOf(leftHorn.matrix).transpose();
    leftHorn.render();

    var rightHorn = new Cube();
    rightHorn.color = GRAY;
    if (g_normalOn) {
        rightHorn.textureNum = -3;
    }
    else {
        rightHorn.textureNum = -2;
    }
    rightHorn.matrix.scale(0.05, 0.15, 0.05);
    rightHorn.matrix.translate(4, 3.3, -15);
    rightHorn.normalMatrix.setInverseOf(rightHorn.matrix).transpose();
    rightHorn.render();

    // LEGS
    var leftFrontLeg = new Cube();
    leftFrontLeg.color = RED;
    if (g_normalOn) {
        leftFrontLeg.textureNum = -3;
    }
    else {
        leftFrontLeg.textureNum = -2;
    }
    leftFrontLeg.matrix.rotate(g_frontLeft, 1, 0, 0);
    leftFrontLeg.matrix.scale(0.2, 0.7, 0.2);
    leftFrontLeg.matrix.translate(-1.5, -0.75, -2);
    leftFrontLeg.normalMatrix.setInverseOf(leftFrontLeg.matrix).transpose();
    leftFrontLeg.render();

    var rightFrontLeg = new Cube();
    rightFrontLeg.color = RED;
    if (g_normalOn) {
        rightFrontLeg.textureNum = -3;
    }
    else {
        rightFrontLeg.textureNum = -2;
    }
    rightFrontLeg.matrix.rotate(-g_frontRight, 1, 0, 0);
    rightFrontLeg.matrix.scale(0.2, 0.7, 0.2);
    rightFrontLeg.matrix.translate(0.5, -0.75, -2);
    rightFrontLeg.normalMatrix.setInverseOf(rightFrontLeg.matrix).transpose();
    rightFrontLeg.render();

    var leftBackLeg = new Cube();
    leftBackLeg.color = RED;
    if (g_normalOn) {
        leftBackLeg.textureNum = -3;
    }
    else {
        leftBackLeg.textureNum = -2;
    }
    leftBackLeg.matrix.rotate(-g_backLeft, 1, 0, 0);
    leftBackLeg.matrix.scale(0.2, 0.7, 0.2);
    leftBackLeg.matrix.translate(-1.5, -0.75, 1);
    leftBackLeg.normalMatrix.setInverseOf(leftBackLeg.matrix).transpose();
    leftBackLeg.render();

    var rightBackLeg = new Cube();
    rightBackLeg.color = RED;
    if (g_normalOn) {
        rightBackLeg.textureNum = -3;
    }
    else {
        rightBackLeg.textureNum = -2;
    }
    rightBackLeg.matrix.rotate(g_backRight, 1, 0, 0);
    rightBackLeg.matrix.scale(0.2, 0.7, 0.2);
    rightBackLeg.matrix.translate(0.5, -0.75, 1);
    rightBackLeg.normalMatrix.setInverseOf(rightBackLeg.matrix).transpose();
    rightBackLeg.render();

    // ----- TAIL -----
    var tailBase = new Cube();
    tailBase.color = OFFWHITE;
    if (g_normalOn) {
        tailBase.textureNum = -3;
    }
    else {
        tailBase.textureNum = -2;
    }
    tailBase.matrix.setRotate(45, 1, 0, 0);
    tailBase.matrix.rotate(g_base, 0, 0, 1);
    var middleCoord = new Matrix4(tailBase.matrix);
    tailBase.matrix.scale(0.05, 0.05, 0.3);
    tailBase.matrix.translate(-0.5, 11.65, -0.25);
    tailBase.normalMatrix.setInverseOf(tailBase.matrix).transpose();
    tailBase.render();

    var tailMiddle = new Cube();
    tailMiddle.color = OFFWHITE;
    if (g_normalOn) {
        tailMiddle.textureNum = -3;
    }
    else {
        tailMiddle.textureNum = -2;
    }
    tailMiddle.matrix = middleCoord;
    tailMiddle.matrix.rotate(g_middle, 0, 1, 1);
    var tipCoord = new Matrix4(tailMiddle.matrix);
    tailMiddle.matrix.scale(0.05, 0.05, 0.2);
    tailMiddle.matrix.translate(-0.5, 11.65, 1.1);
    tailMiddle.normalMatrix.setInverseOf(tailMiddle.matrix).transpose();
    tailMiddle.render();

    var tailTip = new Cube();
    tailTip.color = GRAY;
    if (g_normalOn) {
        tailTip.textureNum = -3;
    }
    else {
        tailTip.textureNum = -2;
    }
    tailTip.matrix = tipCoord;
    tailTip.matrix.rotate(g_tip, 0, 1, 1);
    tailTip.matrix.scale(0.05, 0.05, 0.05);
    tailTip.matrix.translate(-0.5, 11.65, 8.35);
    tailTip.normalMatrix.setInverseOf(tailTip.matrix).transpose();
    tailTip.render();

    // ----- SPOTS -----
    var spot1 = new Cube();
    spot1.color = OFFWHITE;
    if (g_normalOn) {
        spot1.textureNum = -3;
    }
    else {
        spot1.textureNum = -2;
    }
    spot1.matrix.scale(0.4, 0.15, 0.2);
    spot1.matrix.translate(-0.6, 2.345, 1.255);
    spot1.normalMatrix.setInverseOf(spot1.matrix).transpose();
    spot1.render();

    var spot2 = new Cube();
    spot2.color = OFFWHITE;
    if (g_normalOn) {
        spot2.textureNum = -3;
    }
    else {
        spot2.textureNum = -2;
    }
    spot2.matrix.scale(0.15, 0.1, 0.35);
    spot2.matrix.translate(1.005, 4.005, -0.5);
    spot2.normalMatrix.setInverseOf(spot2.matrix).transpose();
    spot2.render();

    var spot3 = new Cube();
    spot3.color = OFFWHITE;
    if (g_normalOn) {
        spot3.textureNum = -3;
    }
    else {
        spot3.textureNum = -2;
    }
    spot3.matrix.scale(0.4, 0.25, 0.55);
    spot3.matrix.translate(-0.755, 1.005, -0.825);
    spot3.normalMatrix.setInverseOf(spot3.matrix).transpose();
    spot3.render();

    var spot4 = new Cube();
    spot4.color = OFFWHITE;
    if (g_normalOn) {
        spot4.textureNum = -3;
    }
    else {
        spot4.textureNum = -2;
    }
    spot4.matrix.scale(0.25, 0.3, 0.1);
    spot4.matrix.translate(0.205, -0.005, -4.55);
    spot4.normalMatrix.setInverseOf(spot4.matrix).transpose();
    spot4.render();

    var spot5 = new Cube();
    spot5.color = OFFWHITE;
    if (g_normalOn) {
        spot5.textureNum = -3;
    }
    else {
        spot5.textureNum = -2;
    }
    spot5.matrix.scale(0.05, 0.2, 0.4);
    spot5.matrix.translate(5.005, -0.005, -0.25);
    spot5.normalMatrix.setInverseOf(spot5.matrix).transpose();
    spot5.render();

    var spot6 = new Cube();
    spot6.color = OFFWHITE;
    if (g_normalOn) {
        spot6.textureNum = -3;
    }
    else {
        spot6.textureNum = -2;
    }
    spot6.matrix.scale(0.15, 0.25, 0.1);
    spot6.matrix.translate(-2.005, -0.005, 3.55);
    spot6.normalMatrix.setInverseOf(spot6.matrix).transpose();
    spot6.render();

    drawMap();

    // ----- PERFORMANCE -----
    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10, "numdot");
    }

    function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}