let scene,
  camera,
  circle,
  circle2,
  circ,
  cloudParticles = [],
  composer;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 100;
  // camera.rotation.x = 1.16;
  // camera.rotation.y = -0.12;
  // camera.rotation.z = 0.27;

  let ambient = new THREE.AmbientLight(0x555555);
  scene.add(ambient);

  let directionalLight = new THREE.DirectionalLight(0xff8c19);
  directionalLight.position.set(0, 0, 1);
  scene.add(directionalLight);

  let orangeLight = new THREE.PointLight(0xcc6600, 50, 450, 1.7);
  orangeLight.position.set(200, 300, 100);
  scene.add(orangeLight);
  let redLight = new THREE.PointLight(0xd8547e, 50, 450, 1.7);
  redLight.position.set(100, 300, 100);
  scene.add(redLight);
  let blueLight = new THREE.PointLight(0x3677ac, 50, 450, 1.7);
  blueLight.position.set(300, 300, 200);
  scene.add(blueLight);
  const geometry1 = new THREE.BoxGeometry(5.1, 6, 80);

  const geometry = new THREE.RingGeometry(5.9, 7, 80, 1, 0, 3.2);
  const geometry2 = new THREE.RingGeometry(5.9, 7, 80, 1, 4, 2);
  // const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  var material = new THREE.ShaderMaterial({
    uniforms: {
      color1: {
        value: new THREE.Color(0xff00f5),
      },
      color2: {
        value: new THREE.Color(0xff0000),
      },
    },
    vertexShader: `
          varying vec2 vUv;

          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
          }
        `,
    fragmentShader: `
          uniform vec3 color1;
          uniform vec3 color2;
        
          varying vec2 vUv;
          
          void main() {
            gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
          }
        `,
    wireframe: false,
  });
  circle = new THREE.Mesh(geometry, material);
  circle2 = new THREE.Mesh(geometry2, material);

  scene.add(circle);
  scene.add(circle2);
  circle2.position.set(0, -0.2, 80);
  circle.position.set(0, -0.2, 80);

  var customMaterial = new THREE.ShaderMaterial({
    uniforms: {
      c: { type: "f", value: 1.0 },
      p: { type: "f", value: 1.4 },
      glowColor: { type: "c", value: new THREE.Color(0xff0000) },
      viewVector: { type: "v3", value: camera.position },
    },
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
  });
  this.circleGlow = new THREE.Mesh(geometry.clone(), customMaterial.clone());
  circleGlow.position = circle.position;
  circleGlow.scale.multiplyScalar(1.2);
  scene.add(circleGlow);

  this.circle2Glow = new THREE.Mesh(geometry2.clone(), customMaterial.clone());
  circle2Glow.position = circle.position;
  circle2Glow.scale.multiplyScalar(1.2);
  scene.add(circle2Glow);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  scene.fog = new THREE.FogExp2(0x1c1445, 0.001);
  renderer.setClearColor(scene.fog.color);
  document.body.appendChild(renderer.domElement);

  var dashMaterial = new THREE.LineDashedMaterial({
    color: 0xff0000,
    linewidth: 1,
    scale: 1,
    dashSize: 3,
    gapSize: 1,
    transparent: true,
    opacity: 0.4,
  });
  var lineMaterial = new THREE.LineBasicMaterial({
    color: 0xff1493,
    linewidth: 1,
    transparent: true,
    opacity: 0.4,
  });
  circGeom = new THREE.CircleGeometry(60, 100);
  circGeom2 = new THREE.CircleGeometry(92, 1000);

  circGeom.vertices.shift();
  circGeom2.vertices.shift();

  var circ2 = new THREE.Line(circGeom2, lineMaterial);
  scene.add(circ2);
  var circ = new THREE.LineSegments(circGeom, dashMaterial);
  scene.add(circ);

  let loader = new THREE.TextureLoader();
  loader.load("smoke.png", function (texture) {
    cloudGeo = new THREE.PlaneBufferGeometry(200, 100);
    cloudMaterial = new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true,
    });

    for (let p = 0; p < 20; p++) {
      let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
      cloud.position.set(
        Math.random() * 50 - 25,
        -20,
        Math.random() * 200 - 170
      );
      // cloud.rotation.x = 1.16;
      // cloud.rotation.y = -0.12;
      cloud.rotation.z = Math.random() * 2 * Math.PI;
      cloud.material.opacity = 0.09;
      cloudParticles.push(cloud);
      scene.add(cloud);
    }
  });
  loader.load("stars.jpg", function (texture) {
    const textureEffect = new POSTPROCESSING.TextureEffect({
      blendFunction: POSTPROCESSING.BlendFunction.COLOR_DODGE,
      texture: texture,
    });
    textureEffect.blendMode.opacity.value = 0.7;

    const bloomEffect = new POSTPROCESSING.BloomEffect({
      blendFunction: POSTPROCESSING.BlendFunction.COLOR_DODGE,
      kernelSize: POSTPROCESSING.KernelSize.SMALL,
      useLuminanceFilter: true,
      luminanceThreshold: 0.3,
      luminanceSmoothing: 0.75,
    });
    bloomEffect.blendMode.opacity.value = 1.5;

    let effectPass = new POSTPROCESSING.EffectPass(
      camera,
      bloomEffect,
      textureEffect
    );
    effectPass.renderToScreen = true;

    composer = new POSTPROCESSING.EffectComposer(renderer);
    composer.addPass(new POSTPROCESSING.RenderPass(scene, camera));
    composer.addPass(effectPass);

    window.addEventListener("resize", onWindowResize, false);
    render();
  });
}

function animate() {
  requestAnimationFrame(animate);

  // circGeom.rotation.x += 0.001;
  circle.rotation.z += 0.001;
  circle2.rotation.z += 0.001;
  update();
  renderer.render(scene, camera);
}

function update() {
  circleGlow.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(
    camera.position,
    circleGlow.position
  );
  circle2Glow.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(
    camera.position,
    circle2Glow.position
  );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
  cloudParticles.forEach((p) => {
    p.rotation.z -= 0.001;
  });
  composer.render(0.1);
  requestAnimationFrame(render);
}

init();
animate();
