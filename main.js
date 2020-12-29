let scene,
  camera,
  circle,
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

  const geometry = new THREE.RingGeometry(5.1, 6, 80, 1, 0, 3.2);
  const geometry2 = new THREE.RingGeometry(5.1, 6, 80, 1, 4, 2);
  const material = new THREE.MeshBasicMaterial({ color: 0xff012f });
  circle = new THREE.Mesh(geometry, material);
  circle2 = new THREE.Mesh(geometry2, material);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  scene.fog = new THREE.FogExp2(0x000018, 0.001);
  renderer.setClearColor(scene.fog.color);
  document.body.appendChild(renderer.domElement);

  let loader = new THREE.TextureLoader();
  loader.load("src/smoke.png", function (texture) {
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
  loader.load("src/stars.jpg", function (texture) {
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

  scene.add(circle);
  scene.add(circle2);
  circle2.position.set(0, 0, 80);
  circle.position.set(0, 0, 80);
}

function animate() {
  requestAnimationFrame(animate);

  // Rotate circle (Change values to change speed)
  circle.rotation.z += 0.001;
  circle2.rotation.z += 0.001;
  //   circle.rotation.y += 0.01;

  renderer.render(scene, camera);
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
