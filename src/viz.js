const C = {
  ME: 0xd58f61,   // var(--accent)
  WE: 0x527d63,   // Forest Green
  YOU: 0x82a6b1,  // Steel Blue
  THEY: 0x6b7280, // Muted Gray
};

function initViz() {
  const vizContainer = document.getElementById("viz-container");
  const vizTooltip = document.getElementById("viz-tooltip");

  if (!vizContainer) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  let size = vizContainer.offsetWidth || 400;
  renderer.setSize(size, size);
  renderer.setPixelRatio(window.devicePixelRatio);
  vizContainer.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const clickableObjects = [];

  const createNode = (x, y, z, who, globalIndex) => {
    const nodeGroup = new THREE.Group();
    nodeGroup.position.set(x, y, z);
    group.add(nodeGroup);

    const geo = new THREE.SphereGeometry(0.1, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color: C[who] });
    const node = new THREE.Mesh(geo, mat);
    nodeGroup.add(node);

    node.userData = { who, index: globalIndex };
    clickableObjects.push(node);

    const glowGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: C[who], transparent: true, opacity: 0.1 });
    const glowNode = new THREE.Mesh(glowGeo, glowMat);
    nodeGroup.add(glowNode);
    return nodeGroup;
  };

  // ── Sculpted Cello Body (Deck & Back) ───────────────────────────────────
  
  // Lower Bout (16 nodes) - WE
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const side = i < 8 ? 1 : -1;
    const r = 2.8;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r - 3;
    const z = Math.cos(angle * 2) * 1.6 * side;
    const n = createNode(x, y, z, "WE", 17 + i);
    
    // Add Ribs (connecting front and back)
    if (i < 8) {
      const backZ = -z;
      const pts = [new THREE.Vector3(x, y, z), new THREE.Vector3(x, y, backZ)];
      const ribGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const ribMat = new THREE.LineBasicMaterial({ color: C.WE, transparent: true, opacity: 0.1 });
      group.add(new THREE.Line(ribGeo, ribMat));
    }
  }

  // Upper Bout (16 nodes) - ME
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const side = i < 8 ? 1 : -1;
    const r = 2.0;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r + 1.2;
    const z = Math.cos(angle * 2) * 1.2 * side;
    createNode(x, y, z, "ME", 1 + i);
  }

  // C-Bouts / Waist (16 nodes) - YOU
  for (let i = 0; i < 16; i++) {
    const side = i < 8 ? 1 : -1;
    const t = (i % 8) / 7;
    const angle = -Math.PI/2 + t * Math.PI;
    const r = 1.1 + Math.abs(Math.sin(t * Math.PI)) * 0.5;
    const x = Math.cos(angle) * r * side;
    const y = -1.2 + t * 2.4;
    const z = Math.sin(angle) * 1.8;
    createNode(x, y, z, "YOU", 33 + i);
  }

  // ── F-Holes and Bridge (Visual Enhancements) ───────────────────────────
  
  // Bridge (Visual Only)
  const bridgeGeo = new THREE.BoxGeometry(1.2, 0.4, 0.1);
  const bridgeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
  const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
  bridge.position.set(0, -1, 1.8);
  group.add(bridge);

  // F-Holes (Using Line Loops)
  [-1, 1].forEach(side => {
    const fPts = [];
    for(let t=0; t<=1; t+=0.1) {
      const fx = (1.5 + Math.sin(t * Math.PI) * 0.3) * side;
      const fy = -1.5 + t * 1.5;
      const fz = 1.7;
      fPts.push(new THREE.Vector3(fx, fy, fz));
    }
    const fCurve = new THREE.CatmullRomCurve3(fPts);
    const fGeo = new THREE.BufferGeometry().setFromPoints(fCurve.getPoints(20));
    const fMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });
    group.add(new THREE.Line(fGeo, fMat));
  });

  // Neck and Strings (16 nodes) - THEY
  const stringX = [-0.3, -0.1, 0.1, 0.3];
  for (let i = 0; i < 16; i++) {
    if (i < 12) {
      const sIdx = i % 4;
      const yLvl = Math.floor(i / 4);
      const y = 3.8 + yLvl * 1.3;
      const x = stringX[sIdx];
      const z = 0.8 - yLvl * 0.15;
      createNode(x, y, z, "THEY", 49 + i);
    } else {
      const t = (i - 12) / 3;
      const angle = t * Math.PI * 3.5;
      const r = 0.2 + t * 0.35;
      const x = Math.cos(angle) * r;
      const y = 8.5 + Math.sin(angle) * r;
      const z = Math.sin(angle) * 0.35;
      createNode(x, y, z, "THEY", 49 + i);
    }
  }

  // Strings
  stringX.forEach(x => {
    const stringPts = [
      new THREE.Vector3(x, -5.5, 0.4),
      new THREE.Vector3(x, -1, 2.2), // Over bridge
      new THREE.Vector3(x, 3.8, 0.8),
      new THREE.Vector3(x * 0.5, 8, 0.6)
    ];
    const curve = new THREE.CatmullRomCurve3(stringPts);
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(30));
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 });
    group.add(new THREE.Line(geometry, material));
  });

  // Background Particles
  const partGeo = new THREE.BufferGeometry();
  const partCount = 300;
  const posArr = new Float32Array(partCount * 3);
  for(let i=0; i<partCount * 3; i++) posArr[i] = (Math.random() - 0.5) * 30;
  partGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  const partMat = new THREE.PointsMaterial({ size: 0.04, color: 0xffffff, transparent: true, opacity: 0.15 });
  const particles = new THREE.Points(partGeo, partMat);
  scene.add(particles);

  camera.position.set(0, 1.5, 15);
  camera.lookAt(0, 1.5, 0);

  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  const onMouseMove = (e) => {
    const rect = vizContainer.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / size) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / size) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);
    const intersects = raycaster.intersectObjects(clickableObjects);
    if (intersects.length > 0) {
      const obj = intersects[0].object;
      vizTooltip.style.opacity = 1;
      vizTooltip.style.left = `${e.clientX - rect.left + 20}px`;
      vizTooltip.style.top = `${e.clientY - rect.top + 20}px`;
      if (window.matrixEntries && window.matrixEntries[obj.userData.index - 1]) {
        const entry = window.matrixEntries[obj.userData.index - 1];
        vizTooltip.innerHTML = `
          <div style="font-weight: 700; color: #${C[obj.userData.who].toString(16).padStart(6, '0')}">${entry.index}. ${entry.label}</div>
          <div style="font-size: 0.7rem; color: #aaa;">${entry.season} · ${obj.userData.who}</div>
        `;
      }
      document.body.style.cursor = "pointer";
    } else {
      vizTooltip.style.opacity = 0;
      document.body.style.cursor = "default";
    }
    if (isDragging) {
      const deltaMove = { x: e.offsetX - previousMousePosition.x, y: e.offsetY - previousMousePosition.y };
      group.rotation.y += deltaMove.x * 0.005;
      group.rotation.x += deltaMove.y * 0.005;
    }
    previousMousePosition = { x: e.offsetX, y: e.offsetY };
  };

  vizContainer.addEventListener('mousedown', () => isDragging = true);
  window.addEventListener('mouseup', () => isDragging = false);
  vizContainer.addEventListener('mousemove', onMouseMove);
  vizContainer.addEventListener("click", (e) => {
    const rect = vizContainer.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / size) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / size) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);
    const intersects = raycaster.intersectObjects(clickableObjects);
    if (intersects.length > 0) {
      const obj = intersects[0].object;
      const entry = window.matrixEntries ? window.matrixEntries[obj.userData.index - 1] : null;
      if (entry && window.filterByWho) window.filterByWho(entry.label);
      document.getElementById("matrix").scrollIntoView({ behavior: "smooth" });
    }
  });

  function animate() {
    requestAnimationFrame(animate);
    if (!isDragging) { group.rotation.y += 0.003; group.rotation.x = Math.sin(Date.now() * 0.0004) * 0.08; }
    particles.rotation.y += 0.0005;
    renderer.render(scene, camera);
  }
  animate();
  window.addEventListener("resize", () => {
    size = vizContainer.offsetWidth || 400;
    renderer.setSize(size, size);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  });
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initViz); } else { initViz(); }
