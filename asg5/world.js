/* 
 * FJ Tria (@fjstria)
 * CSE160/asg5/world.js
 */

// Low Poly Bulbasaur by Tipatat Chennavasin [CC-BY] via Poly Pizza
// Low Poly Charmander by Tipatat Chennavasin [CC-BY] via Poly Pizza
// Low Poly Squirtle by Tipatat Chennavasin [CC-BY] via Poly Pizza
// Low Poly Pokeball by Tipatat Chennavasin [CC-BY] via Poly Pizza

import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/OrbitControls.js';
import { OBJLoader } from './lib/OBJLoader.js';
import { MTLLoader } from './lib/MTLLoader.js';

function main() {
    // ----- SETUP -----
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
    });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;


    // ----- CAMERA -----
    let camera;
    initCamera();
    let controls = new OrbitControls(camera, canvas);

    const scene = new THREE.Scene();
    function initCamera() {
        const fov = 80;
        const aspect = 2;
        const near = 0.1;
        const far = 100;
        camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.set(0, 12, 30);

        const controls = new OrbitControls(camera, canvas);
        controls.target.set(0, 12, 0);
        controls.update();
    }


    // ----- LIGHTS -----
    {
        const color = 0xFFFFFF;
        const intensity = 0.3;
        const light = new THREE.AmbientLight(color, intensity);
        scene.add(light);
    }

    {
        const skyColor = 0xB1E1FF;
        const groundColor = 0xB97A20;
        const intensity = 0.4;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);
    }

    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.PointLight(color, intensity);
        light.position.set(-8, 22, -15);
        light.castShadow = true;
        scene.add(light);
    }

    {
        const color = 0xFFEAD0;
        const intensity = 0.2;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, 10, 0);
        light.target.position.set(-5, 0, 0);

        scene.add(light);
        scene.add(light.target);
    }

    {   // ----- FLOOR -----
        const planeSize = 80;

        const loader = new THREE.TextureLoader();
        const texture = loader.load('./grass.jpg');
        texture.encoding = THREE.sRGBEncoding;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        const repeats = planeSize / 2;
        texture.repeat.set(repeats, repeats);

        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.receiveShadow = true;
        mesh.rotation.x = Math.PI * -.5;
        scene.add(mesh);
    }

    {    // ----- SKYBOX -----
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
        './background/wall2.png',
        './background/wall4.png',
        './background/ceiling.png',
        './background/floor.png',
        './background/wall3.png',
        './background/wall1.png',
        ]);
        scene.background = texture;
    }

    {   // ----- FOG -----
        const color = 0xFFEAD0;
        const near = 0;
        const far = 100;
        scene.fog = new THREE.Fog(color, near, far);
    }

    // ----- MODELS -----
    makeLabel(1500, 250, 'I Choose You!', [0, 15, -2.5]);

    {   // ----- BULBASAUR -----
        const mtlLoader = new MTLLoader();
        const objLoader = new OBJLoader();

        mtlLoader.load('./models/bulbasaur/materials.mtl', (mtl) => {
            mtl.preload();
            for (const material of Object.values(mtl.materials)) {
                material.side = THREE.DoubleSide;
            }
            objLoader.setMaterials(mtl);
        objLoader.load('./models/bulbasaur/model.obj', (root) => {
            root.scale.set(12, 12, 12);
            root.rotation.y = 135;
            root.position.set(-15, 2.5, -5);
            scene.add(root);
        });
        });
    }
        makeLabel(1300, 150, 'Bulbasaur: The Grass-Type Pokémon', [-15, 10, -2.5]);



    {   // ----- CHARMANDER -----
        const mtlLoader = new MTLLoader();
        const objLoader = new OBJLoader();
        
        mtlLoader.load('./models/charmander/materials.mtl', (mtl) => {
            mtl.preload();
            for (const material of Object.values(mtl.materials)) {
                material.side = THREE.DoubleSide;
            }
            objLoader.setMaterials(mtl);
        objLoader.load('./models/charmander/model.obj', (root) => {
                root.scale.set(15, 15, 15);
                root.rotation.y = 135;
                root.position.set(0, 4.25, -5);
                scene.add(root);
        });
        });
    }
        makeLabel(1300, 150, 'Charmander: The Fire-Type Pokémon', [0, 10, -2.5]);


    {   // ----- SQUIRTLE -----
        const mtlLoader = new MTLLoader();
        const objLoader = new OBJLoader();

        mtlLoader.load('./models/squirtle/materials.mtl', (mtl) => {
            mtl.preload();
            for (const material of Object.values(mtl.materials)) {
                material.side = THREE.DoubleSide;
            }
            objLoader.setMaterials(mtl);
        objLoader.load('./models/squirtle/model.obj', (root) => {
            root.scale.set(30, 30, 30);
            root.rotation.y = 180;
            root.position.set(15, 5.5, -5);
            scene.add(root);
        });
        });
    }
        makeLabel(1300, 150, 'Squirtle: The Water-Type Pokémon', [15, 10, -2.5]);

    {   // ----- POKEBALL 1 -----
        const mtlLoader = new MTLLoader();
        const objLoader = new OBJLoader();

        mtlLoader.load('./models/pokeball/materials.mtl', (mtl) => {
            mtl.preload();
            for (const material of Object.values(mtl.materials)) {
                material.side = THREE.DoubleSide;
            }
            objLoader.setMaterials(mtl);
        objLoader.load('./models/pokeball/model.obj', (root) => {
            root.scale.set(7, 7, 7);
            root.rotation.y = 180;
            root.position.set(-15, 1.75, 1);
            scene.add(root);
        });
        });
    }

    {   // ----- POKEBALL 2 -----
        const mtlLoader = new MTLLoader();
        const objLoader = new OBJLoader();

        mtlLoader.load('./models/pokeball/materials.mtl', (mtl) => {
            mtl.preload();
            for (const material of Object.values(mtl.materials)) {
                material.side = THREE.DoubleSide;
            }
            objLoader.setMaterials(mtl);
        objLoader.load('./models/pokeball/model.obj', (root) => {
            root.scale.set(7, 7, 7);
            root.rotation.y = 180;
            root.position.set(0, 1.75, 1);
            scene.add(root);
        });
        });
    }

    {   // ----- POKEBALL 3 -----
        const mtlLoader = new MTLLoader();
        const objLoader = new OBJLoader();

        mtlLoader.load('./models/pokeball/materials.mtl', (mtl) => {
            mtl.preload();
            for (const material of Object.values(mtl.materials)) {
                material.side = THREE.DoubleSide;
            }
            objLoader.setMaterials(mtl);
        objLoader.load('./models/pokeball/model.obj', (root) => {
            root.scale.set(7, 7, 7);
            root.rotation.y = 180;
            root.position.set(15, 1.75, 1);
            scene.add(root);
        });
        });
    }

    // ----- CUBES -----
    const cubes = [];
    const boxWidth = 12;
    const boxHeight = 12;
    const boxDepth = 12;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
  
    const loadManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader();
  
    const materials = [
      new THREE.MeshPhongMaterial({ map: loader.load('./boxart/red.jpg') }),
      new THREE.MeshPhongMaterial({ map: loader.load('./boxart/green.jpg') }),
      new THREE.MeshPhongMaterial({ map: loader.load('./boxart/blue.jpg') }),
      new THREE.MeshPhongMaterial({ map: loader.load('./boxart/yellow.jpg') }),
      new THREE.MeshPhongMaterial({ map: loader.load('./boxart/firered.jpg') }),
      new THREE.MeshPhongMaterial({ map: loader.load('./boxart/leafgreen.jpg') }),
    ];
        // 4
    const cube = new THREE.Mesh(geometry, materials);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.position.set(-7, 6, -25);
    cube.rotation.y = 25;
    scene.add(cube);

    // ----- BOX STACK ----- 
    {   // 5
      const boxWidth1 = 10;
      const boxHeight1 = 10;
      const boxDepth1 = 10;
      const geometry1 = new THREE.BoxGeometry(boxWidth1, boxHeight1, boxDepth1);
      const material1 = new THREE.MeshPhongMaterial({ color: 0x83BA36 });
      const cube1 = new THREE.Mesh(geometry1, material1);
      cube1.castShadow = true;
      cube1.receiveShadow = true;
      cube1.position.set(15, 5, -20);
      scene.add(cube1);
    }
  
    {   // 6
      const boxWidth1 = 10;
      const boxHeight1 = 10;
      const boxDepth1 = 10;
      const geometry1 = new THREE.BoxGeometry(boxWidth1, boxHeight1, boxDepth1);
      const material1 = new THREE.MeshPhongMaterial({ color: 0xFE9441 });
      const cube1 = new THREE.Mesh(geometry1, material1);
      cube1.castShadow = true;
      cube1.receiveShadow = true;
      cube1.position.set(19, 15, -19);
      scene.add(cube1);
    }
  
    {   // 7
      const boxWidth1 = 10;
      const boxHeight1 = 10;
      const boxDepth1 = 10;
      const geometry1 = new THREE.BoxGeometry(boxWidth1, boxHeight1, boxDepth1);
      const material1 = new THREE.MeshPhongMaterial({ color: 0x93C8D0 });
      const cube1 = new THREE.Mesh(geometry1, material1);
      cube1.castShadow = true;
      cube1.receiveShadow = true;
      cube1.position.set(17, 25, -21);
      scene.add(cube1);
    }

    // ----- TABLE SIDES -----
    {   // BACK     8
        const boxWidth1 = 80;
        const boxHeight1 = 5;
        const boxDepth1 = 5;
        const geometry1 = new THREE.BoxGeometry(boxWidth1, boxHeight1, boxDepth1);
        const loader1 = new THREE.TextureLoader();
        const material1 = new THREE.MeshPhongMaterial({ map: loader1.load('./grass.jpg') });
        const cube1 = new THREE.Mesh(geometry1, material1);

        cube1.position.set(0, 2.5, -40);
        scene.add(cube1);
    }

    {    // LEFT    9
        const boxWidth1 = 80;
        const boxHeight1 = 5;
        const boxDepth1 = 5;
        const geometry1 = new THREE.BoxGeometry(boxWidth1, boxHeight1, boxDepth1);
        const loader1 = new THREE.TextureLoader();
        const material1 = new THREE.MeshPhongMaterial({ map: loader1.load('./grass.jpg') });
        const cube1 = new THREE.Mesh(geometry1, material1);

        cube1.position.set(-38, 2.5, 0);
        cube1.rotation.y = 4.7;
        scene.add(cube1);
    }

    {    // RIGHT   10
        const boxWidth1 = 80;
        const boxHeight1 = 5;
        const boxDepth1 = 5;
        const geometry1 = new THREE.BoxGeometry(boxWidth1, boxHeight1, boxDepth1);
        const loader1 = new THREE.TextureLoader();
        const material1 = new THREE.MeshPhongMaterial({ map: loader1.load('./grass.jpg') });
        const cube1 = new THREE.Mesh(geometry1, material1);

        cube1.position.set(37, 2.5, 0);
        cube1.rotation.y = 4.7;
        scene.add(cube1);
    }

    {    // FRONT   11
        const boxWidth1 = 80;
        const boxHeight1 = 5;
        const boxDepth1 = 5;
        const geometry1 = new THREE.BoxGeometry(boxWidth1, boxHeight1, boxDepth1);
        const loader1 = new THREE.TextureLoader();
        const material1 = new THREE.MeshPhongMaterial({ map: loader1.load('./grass.jpg') });
        const cube1 = new THREE.Mesh(geometry1, material1);

        cube1.position.set(-1, 2.5, 40);
        scene.add(cube1);
    }

    // ----- OTHER SHAPES -----
    {
        const geo = new THREE.IcosahedronGeometry(2.3);
        const loadr = new THREE.TextureLoader();
        const matr = new THREE.MeshPhongMaterial({ color: 0xFE9441 });
        const cb = new THREE.Mesh(geo, matr);
    
        cb.position.set(-30, 18, -20);
        cubes.push(cb);
        scene.add(cb);
      }

      {
        const geom = new THREE.CylinderGeometry(1, 1, 15, 20);
        const matr = new THREE.MeshPhongMaterial({ color: 0x83BA36 });
        const cb = new THREE.Mesh(geom, matr);
        cb.castShadow = true;
        cb.receiveShadow = true;
        cb.position.set(-30, 7.5, -20);
        scene.add(cb);
      }

      {
        const geom = new THREE.CylinderGeometry(1, 1, 15, 20);
        const matr = new THREE.MeshPhongMaterial({ color: 0x83BA36 });
        const cb = new THREE.Mesh(geom, matr);
        cb.position.set(30, 7.5, -20);
        scene.add(cb);
      }

      {
        const geom = new THREE.IcosahedronGeometry(2.3);
        const matr = new THREE.MeshPhongMaterial({ color: 0xFE9441 });
        const cb = new THREE.Mesh(geom, matr);
        cb.position.set(30, 18, -20);
        cubes.push(cb);
        scene.add(cb);
      }
    
      {
        const geom = new THREE.TetrahedronGeometry(2);
        const matr = new THREE.MeshPhongMaterial({ color: 0x93C8D0 });
        const cb = new THREE.Mesh(geom, matr);
        cb.castShadow = true;
        cb.receiveShadow = true;
        cb.position.set(-5, 2, 25.5);
        cb.rotation.y = 25;
        scene.add(cb);
      }
    
      {
        const geom = new THREE.OctahedronGeometry(2);
        const matr = new THREE.MeshPhongMaterial({ color: 0x93C8D0 });
        const cb = new THREE.Mesh(geom, matr);
        cb.castShadow = true;
        cb.receiveShadow = true;
        cb.position.set(-8, 2, 18.5);
        cb.rotation.y = 15;
        scene.add(cb);
      }


    // ----- BILLBOARDS -----
    function makeLabel(labelWidth, size, name, posxyz) {
        const canvas = makeLabelCanvas(labelWidth, size, name);
        const texture = new THREE.CanvasTexture(canvas);

        texture.minFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        const labelMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        });

        const root = new THREE.Object3D();

        const labelBaseScale = 0.01;
        const label = new THREE.Sprite(labelMaterial);
        root.add(label);
        label.position.x = posxyz[0];
        label.position.y = posxyz[1] + 4;
        label.position.z = posxyz[2];

        label.scale.x = canvas.width * labelBaseScale;
        label.scale.y = canvas.height * labelBaseScale;

        scene.add(root);
        return root;
    }
    
    function makeLabelCanvas(baseWidth, size, name) {
        const borderSize = 2;
        const ctx = document.createElement('canvas').getContext('2d');
        const font = `${size}px bold sans-serif`;
        ctx.font = font;

        // MEASURE NAME LENGTH
        const textWidth = ctx.measureText(name).width;

        const doubleBorderSize = borderSize * 2;
        const width = baseWidth + doubleBorderSize;
        const height = size + doubleBorderSize;
        ctx.canvas.width = width;
        ctx.canvas.height = height;

        // SET FONT
        ctx.font = font;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, width, height);

        // SCALE
        const scaleFactor = Math.min(1, baseWidth / textWidth);
        ctx.translate(width / 2, height / 2);
        ctx.scale(scaleFactor, 1);
        ctx.fillStyle = 'white';
        ctx.fillText(name, 0, 0);

        return ctx.canvas;
    }

    // ----- RESIZE RENDER -----
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
        renderer.setSize(width, height, false);
        }
        return needResize;
    }

    // ----- RENDER -----
    function render(time) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        }

        cubes.forEach((cube, ndx) => {
            const speed = 5 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
          });

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();