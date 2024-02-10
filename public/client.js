import * as THREE from '/build/three.module.js';

const canvas = document.querySelector('#globe');
if (!canvas) {
	console.error('Canvas element not found.');
} else {
	console.log(THREE);

	const scene = new THREE.Scene();

	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	const renderer = new THREE.WebGLRenderer({
		canvas: document.querySelector('#globe'),
		antialias: true,
	});

	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	camera.position.setZ(1.5);
	camera.position.setY(0.1);
	camera.position.setX(-1);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	renderer.render(scene, camera);

	const globeTexture = new THREE.TextureLoader().load('./dist/img/threejs/world4.png');
	const cloudsTexture = new THREE.TextureLoader().load('./dist/img/threejs/clouds1.png');
	const mapbordersTexture = new THREE.TextureLoader().load('./dist/img/threejs/worldMapSVG.svg');

	const earthGeometry = new THREE.SphereGeometry(1, 50, 50);
	const earthMaterial = new THREE.MeshStandardMaterial({
		side: THREE.DoubleSide,
		map: globeTexture,
		transparent: false,
		roughness: 0.5,
	});

	const earth = new THREE.Mesh(earthGeometry, earthMaterial);
	scene.add(earth);

	const cloudsGeometry1 = new THREE.SphereGeometry(1.016, 32, 32);
	const cloudsMaterial1 = new THREE.MeshStandardMaterial({
		side: THREE.FrontSide,
		map: cloudsTexture,
		transparent: true,
		roughness: 1,
	});

	const clouds1 = new THREE.Mesh(cloudsGeometry1, cloudsMaterial1);
	scene.add(clouds1);

	const cloudsGeometry2 = new THREE.SphereGeometry(1.016, 32, 32);
	const cloudsMaterial2 = new THREE.MeshStandardMaterial({
		side: THREE.FrontSide,
		map: cloudsTexture,
		transparent: true,
		roughness: 1,
	});

	const clouds2 = new THREE.Mesh(cloudsGeometry2, cloudsMaterial2);
	scene.add(clouds2);

	const mapGeometry = new THREE.SphereGeometry(1.008, 31, 31);
	const mapMaterial = new THREE.MeshStandardMaterial({
		side: THREE.FrontSide,
		map: mapbordersTexture,
		transparent: true,
		roughness: 0.7,
	});

	const map = new THREE.Mesh(mapGeometry, mapMaterial);

	const atmosphereMaterial = new THREE.ShaderMaterial({
		uniforms: {
			c: { type: 'f', value: 0.5 },
			p: { type: 'f', value: 3.5 },
			lightDirection: { type: 'v3', value: new THREE.Vector3(-1, 0.3, -1).normalize() },
		},
		vertexShader: `
			varying vec3 vNormal;
			varying vec3 viewDirection;
	
			void main() {
				vNormal = normalize(normalMatrix * normal * -1.0);
				vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
				viewDirection = normalize(viewPosition.xyz);
				gl_Position = projectionMatrix * viewPosition;
			}
		`,
		fragmentShader: `
			varying vec3 vNormal;
			varying vec3 viewDirection;
			uniform float c;
			uniform float p;
			uniform vec3 lightDirection;
	
			void main() {
				float intensity = pow(c - dot(vNormal, viewDirection), p);
	
				// Compute the angle between the normal and light direction
				float lightAngle = max(0.0, dot(vNormal, -lightDirection)); // Odwróć kierunek światła
	
				// Adjust intensity based on the light angle
				intensity *= lightAngle;
	
				// Adjust transparency based on the light angle
				float transparency = 1.0 - lightAngle;
	
				// Increase intensity for better visibility
				intensity *= 1.5;
	
				// Make it visible from both sides
				gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
				gl_FragColor.a *= transparency;
			}
		`,
		side: THREE.BackSide,
		transparent: true,
	});

	const atmosphereGeometry = new THREE.SphereGeometry(1.1, 35, 35);
	const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
	scene.add(atmosphere);

	clouds1.renderOrder = 2;
	map.renderOrder = 1;

	const starsGeometry = new THREE.BufferGeometry();
	const starsMaterial = new THREE.PointsMaterial({
		color: 0xffffff,
		size: 0.02,
		transparent: true,
		opacity: 0.5,
	});

	const starsVertices = [];
	for (let i = 0; i < 1000; i++) {
		const x = (Math.random() - 0.5) * 2000;
		const y = (Math.random() - 0.5) * 2000;
		const z = (Math.random() - 0.5) * 2000;
		starsVertices.push(x, y, z);
	}

	starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
	const stars = new THREE.Points(starsGeometry, starsMaterial);
	scene.add(stars);

	const directionalLighting = new THREE.DirectionalLight(0xffffff, 1);
	directionalLighting.position.set(-4, 1, -1.5);
	directionalLighting.target.position.set(0, 0, 0);

	const ambientLight = new THREE.AmbientLight(0x404040, 1);
	scene.add(directionalLighting, ambientLight);

	const backgroundColor = new THREE.Color(0x030405);
	scene.background = backgroundColor;

	const loader = new THREE.CubeTextureLoader();
	loader.setPath('');

	earth.rotation.y = 3.4;
	clouds1.rotation.y = 3.4;
	clouds2.rotation.y = 1;
	map.rotation.y = 3.4;
	earth.rotation.z = -0.5;
	clouds1.rotation.z = -0.5;
	clouds2.rotation.z = -0.5;
	map.rotation.z = -0.5;

	function animate() {
		requestAnimationFrame(animate);

		earth.rotation.y += 0.0003;
		clouds1.rotation.y += 0.0005;
		clouds2.rotation.y += 0.0005;
		map.rotation.y += 0.0003;

		renderer.render(scene, camera);
	}

	animate();

	scene.traverse((object) => {
		if (object.material && object.material.transparent) {
			object.material.depthWrite = false;
		}
	});

	function handleResize() {
		const newWidth = window.innerWidth;
		const newHeight = window.innerHeight;

		camera.aspect = newWidth / newHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(newWidth, newHeight);
	}

	window.addEventListener('resize', handleResize);
}
