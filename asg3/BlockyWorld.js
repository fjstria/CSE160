/* 
 * FJ Tria (@fjstria)
 * CSE160/asg3/BlockyWorld.js
 */

// ----- VERTEX SHADER -----
var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }`

// ----- FRAGMENT SHADER -----
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform sampler2D u_Sampler3;
    uniform int u_whichTexture;
    void main() {
        if (u_whichTexture == -2) {
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
        else if (u_whichTexture == 4) {
            gl_FragColor = vec4(0.41569, 0.55294, 0.45098, 1);
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
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_whichTexture;

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

    // ugh.
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('bruh');
        console.log('Failed to get the storage location of a_UV');
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
let g_camSlider = 0;
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

function addActionForHtmlUI() {
    // ----- SLIDERS -----
    document.getElementById('angleSlide').addEventListener('mousemove', function () { g_camSlider = this.value; renderScene(); });

    document.getElementById('frontLeft').addEventListener('mousemove', function () { g_frontLeft = this.value; renderScene(); });
    document.getElementById('frontRight').addEventListener('mousemove', function () { g_frontRight = this.value; renderScene(); });
    document.getElementById('backLeft').addEventListener('mousemove', function () { g_backLeft = this.value; renderScene(); });
    document.getElementById('backRight').addEventListener('mousemove', function () { g_backRight = this.value; renderScene(); });
    document.getElementById('base').addEventListener('mousemove', function () { g_base = this.value; renderScene(); });
    document.getElementById('middle').addEventListener('mousemove', function () { g_middle = this.value; renderScene(); });
    document.getElementById('tip').addEventListener('mousemove', function () { g_tip = this.value; renderScene(); });

    // ----- BUTTONS -----
    document.getElementById('on').addEventListener('click', function () { g_animate = true; });
    document.getElementById('off').addEventListener('click', function () { g_animate = false; });
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

function click(ev, check){
    // if shift click then animate shroom
    if(ev.shiftKey){
        shift_key = true;
    } 
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
    if (shift_key) {
        g_stem += 0.05
        g_shroom -= 0.01
        time += 0.1;
        if (time >= 4.25) {
            time = 0;
            shift_key = false;
        }
    }
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
                body.textureNum = 1;
                body.matrix.translate(x - 4, -.75, y - 4);
                body.renderfaster();
            }
            else if (g_map[x][y] == 2) {
                var body = new Cube();
                body.textureNum = 1;
                body.matrix.translate(x - 3.5, -.9, y - 4);
                body.render();
            }
            else if (g_map[x][y] == 3) {
                var body = new Cube();
                body.textureNum = 2;
                body.matrix.translate(x - 3.5, -.3, y - 4);
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

    // ----- COLORS -----
    var RED = [0.65, 0.13, 0.10, 1.0];
    var OFFWHITE = [0.69, 0.69, 0.69, 1.0];
    var GRAY = [0.47, 0.47, 0.47, 1.0];
    var TAN = [0.58, 0.56, 0.38, 1.0];
    var BLACK = [0, 0, 0, 1];

    // ----- FLOOR -----
    var floor = new Cube();
    floor.textureNum = 1;
    floor.matrix.translate(0, -0.525, 0);
    floor.matrix.scale(10, 0, 10);
    floor.matrix.translate(-.5, 0, -.5);
    floor.render();

    // ----- SKY -----
    var sky = new Cube();
    sky.color = [0, 1, 1, 1];
    sky.textureNum = 0;
    sky.matrix.scale(50, 50, 50);
    sky.matrix.translate(-.5, -.5, -.5);
    sky.render();

    drawMap();

    // ----- BLOCKY ANIMAL -----
    // BODY 
    var body = new Cube();
    body.color = RED;
    body.matrix.scale(0.6, 0.5, 0.9);
    body.matrix.translate(-0.5, 0, -0.5);
    body.render();

    // HEAD
    var head = new Cube();
    head.color = RED;
    head.matrix.scale(0.4, 0.4, 0.4);
    head.matrix.translate(-0.5, 0.5, -2.125);
    head.render();

    var face = new Cube();
    face.color = OFFWHITE;
    face.matrix.scale(0.3, 0.2, 0.05);
    face.matrix.translate(-0.5, 1, -17.25);
    face.render();

    var nose = new Cube();
    nose.color = GRAY;
    nose.matrix.scale(0.2, 0.1, 0.05);
    nose.matrix.translate(-0.5, 2, -17.5);
    nose.render();

    var leftNostril = new Cube();
    leftNostril.color = BLACK;
    leftNostril.matrix.scale(0.0499, 0.0499, 0.05);
    leftNostril.matrix.translate(-2, 5, -17.75);
    leftNostril.render();

    var rightNostril = new Cube();
    rightNostril.color = BLACK;
    rightNostril.matrix.scale(0.0499, 0.0499, 0.05);
    rightNostril.matrix.translate(1, 5, -17.75);
    rightNostril.render();

    var leftEye = new Cube();
    leftEye.color = BLACK;
    leftEye.matrix.scale(0.099, 0.099, 0.05);
    leftEye.matrix.translate(-2, 3.5, -17.5);
    leftEye.render();

    var rightEye = new Cube();
    rightEye.color = BLACK;
    rightEye.matrix.scale(0.099, 0.099, 0.05);
    rightEye.matrix.translate(1, 3.5, -17.5);
    rightEye.render();

    var leftHorn = new Cube();
    leftHorn.color = GRAY;
    leftHorn.matrix.scale(0.05, 0.15, 0.05);
    leftHorn.matrix.translate(-5, 3.3, -15);
    leftHorn.render();

    var rightHorn = new Cube();
    rightHorn.color = GRAY;
    rightHorn.matrix.scale(0.05, 0.15, 0.05);
    rightHorn.matrix.translate(4, 3.3, -15);
    rightHorn.render();

    // LEGS
    var leftFrontLeg = new Cube();
    leftFrontLeg.color = RED;
    leftFrontLeg.matrix.rotate(g_frontLeft, 1, 0, 0);
    leftFrontLeg.matrix.scale(0.2, 0.7, 0.2);
    leftFrontLeg.matrix.translate(-1.5, -0.75, -2);
    leftFrontLeg.render();

    var rightFrontLeg = new Cube();
    rightFrontLeg.color = RED;
    rightFrontLeg.matrix.rotate(-g_frontRight, 1, 0, 0);
    rightFrontLeg.matrix.scale(0.2, 0.7, 0.2);
    rightFrontLeg.matrix.translate(0.5, -0.75, -2);
    rightFrontLeg.render();

    var leftBackLeg = new Cube();
    leftBackLeg.color = RED;
    leftBackLeg.matrix.rotate(-g_backLeft, 1, 0, 0);
    leftBackLeg.matrix.scale(0.2, 0.7, 0.2);
    leftBackLeg.matrix.translate(-1.5, -0.75, 1);
    leftBackLeg.render();

    var rightBackLeg = new Cube();
    rightBackLeg.color = RED;
    rightBackLeg.matrix.rotate(g_backRight, 1, 0, 0);
    rightBackLeg.matrix.scale(0.2, 0.7, 0.2);
    rightBackLeg.matrix.translate(0.5, -0.75, 1);
    rightBackLeg.render();

    // MUSHROOMS
    // the cones don't work don't ask questions
    var frontStem = new Cube();
    frontStem.color = TAN;
    frontStem.matrix.scale(0.05, 0.15, 0.05);
    frontStem.matrix.translate(-2, 3, -3);
    frontStem.render();

    /*
    var frontShroom = new Cone();
    frontShroom.color = RED;
    frontShroom.matrix.rotate(90,1,0,0);
    frontShroom.matrix.translate(-0.075, -0.125, -0.75);
    frontShroom.matrix.scale(1, 1, 0.75)
    frontShroom.render();
    */

    var backStem = new Cube();
    backStem.color = TAN;
    backStem.matrix.scale(0.05, 0.15, 0.05);
    backStem.matrix.translate(4.5, 3, 7.5);
    backStem.render();

    /*
    var backShroom = new Cone();
    backShroom.color = RED;
    backShroom.matrix.rotate(90,1,0,0);
    backShroom.matrix.translate(0.25, 0.405, -0.75);
    backShroom.matrix.scale(1, 1, 0.75)
    backShroom.render();
    */

    var headStem = new Cube();
    headStem.color = TAN;
    headStem.matrix.scale(0.05, 0.15, 0.05);
    headStem.matrix.translate(-0.75, 1.75, -13.75);
    headStem.matrix.translate(0, g_stem, 0);
    headStem.render()

    /*
    var headShroom = new Cone();
    headShroom.color = RED;
    headShroom.matrix.rotate(90,1,0,0);
    headShroom.matrix.translate(-0.015, -0.665, -0.55)
    headShroom.matrix.scale(1, 1, 0.75)
    headShroom.matrix.translate(0, 0, g_shroom);
    headShroom.render();
    */

    // ----- TAIL -----
    var tailBase = new Cube();
    tailBase.color = OFFWHITE;
    tailBase.matrix.setRotate(45, 1, 0, 0);
    tailBase.matrix.rotate(g_base, 0, 0, 1);
    var middleCoord = new Matrix4(tailBase.matrix);
    tailBase.matrix.scale(0.05, 0.05, 0.3);
    tailBase.matrix.translate(-0.5, 11.65, -0.25);
    tailBase.render();

    var tailMiddle = new Cube();
    tailMiddle.color = OFFWHITE;
    tailMiddle.matrix = middleCoord;
    tailMiddle.matrix.rotate(g_middle, 0, 1, 1);
    var tipCoord = new Matrix4(tailMiddle.matrix);
    tailMiddle.matrix.scale(0.05, 0.05, 0.2);
    tailMiddle.matrix.translate(-0.5, 11.65, 1.1);
    tailMiddle.render();

    var tailTip = new Cube();
    tailTip.color = GRAY;
    tailTip.matrix = tipCoord;
    tailTip.matrix.rotate(g_tip, 0, 1, 1);
    tailTip.matrix.scale(0.05, 0.05, 0.05);
    tailTip.matrix.translate(-0.5, 11.65, 8.35);
    tailTip.render();

    // ----- SPOTS -----
    var spot1 = new Cube();
    spot1.color = OFFWHITE;
    spot1.matrix.scale(0.4, 0.15, 0.2);
    spot1.matrix.translate(-0.6, 2.345, 1.255);
    spot1.render();

    var spot2 = new Cube();
    spot2.color = OFFWHITE;
    spot2.matrix.scale(0.15, 0.1, 0.35);
    spot2.matrix.translate(1.005, 4.005, -0.5);
    spot2.render();

    var spot3 = new Cube();
    spot3.color = OFFWHITE;
    spot3.matrix.scale(0.4, 0.25, 0.55);
    spot3.matrix.translate(-0.755, 1.005, -0.825);
    spot3.render();

    var spot4 = new Cube();
    spot4.color = OFFWHITE;
    spot4.matrix.scale(0.25, 0.3, 0.1);
    spot4.matrix.translate(0.205, -0.005, -4.55);
    spot4.render();

    var spot5 = new Cube();
    spot5.color = OFFWHITE;
    spot5.matrix.scale(0.05, 0.2, 0.4);
    spot5.matrix.translate(5.005, -0.005, -0.25);
    spot5.render();

    var spot6 = new Cube();
    spot6.color = OFFWHITE;
    spot6.matrix.scale(0.15, 0.25, 0.1);
    spot6.matrix.translate(-2.005, -0.005, 3.55);
    spot6.render();

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