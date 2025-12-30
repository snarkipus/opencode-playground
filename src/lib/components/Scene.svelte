<script lang="ts">
	import { T, useThrelte, useTask } from '@threlte/core';
	import {
		OrbitControls,
		useGltf,
		ContactShadows,
		Grid,
		useProgress,
		useDraco,
		useMeshopt
	} from '@threlte/extras';
	import { Vector3, Box3, Spherical, Mesh } from 'three';

	interface Props {
		paused: boolean;
		targetView?: 'front' | 'back' | 'left' | 'right' | 'top' | 'initial' | null;
		onTransitionComplete?: () => void;
		onProgress?: (progress: number) => void;
	}

	let { paused, targetView = null, onTransitionComplete, onProgress }: Props = $props();
	let rotation = $state(0);

	const { progress } = useProgress();

	$effect(() => {
		onProgress?.($progress);
	});

	// Pre-allocate stable Three.js objects for useTask (high frequency)
	const targetPos = new Vector3();
	const currentDir = new Vector3();
	const targetDir = new Vector3();
	const finalDir = new Vector3();
	const currentSpherical = new Spherical();
	const targetSpherical = new Spherical();

	// Use $state for reactive properties used in the template
	let size = $state(10);
	let boxHeight = $state(2);
	let offset = $state(new Vector3(0, 0, 0));
	const verticalShift = $derived(size * 0.05 + 2.5); // Slightly higher base offset

	// Pre-allocated but reactive vectors for camera logic
	const shipCenter = $derived(new Vector3(0, verticalShift, 0));
	// Look even lower to move the ship up in the viewport
	const cameraTarget = $derived(new Vector3(0, verticalShift - size * 0.25, 0));

	// Calculate floor position (bottom of ship + custom hover offset)
	const floorY = $derived(verticalShift - (2 * boxHeight) / 3);

	const { camera } = useThrelte();
	const dracoLoader = useDraco('/draco/');
	const meshoptDecoder = useMeshopt();
	const gltf = useGltf('/models/ship_pinnace1_final.glb', {
		dracoLoader,
		meshoptDecoder
	});

	let hasNotifiedCompletion = false;

	$effect(() => {
		if ($gltf) {
			const box = new Box3().setFromObject($gltf.scene);
			const boxCenter = new Vector3();
			box.getCenter(boxCenter);
			const boxSize = new Vector3();
			box.getSize(boxSize);

			// Enable shadows for all meshes in the model
			$gltf.scene.traverse((node) => {
				if (node instanceof Mesh) {
					node.castShadow = true;
					node.receiveShadow = true;
				}
			});

			// Auto-center the model
			offset = boxCenter.clone().multiplyScalar(-1);
			size = Math.max(boxSize.x, boxSize.y, boxSize.z);
			boxHeight = boxSize.y;
			rotation = 0; // Reset rotation to 0 when model appears
		}
	});

	const defaultCameraPosition = $derived<[number, number, number]>([size * 0.707, 0, size * 0.707]);

	const viewPositions = $derived({
		front: [0, size * 0.2, size * 1.0],
		back: [0, size * 0.2, -size * 1.0],
		left: [-size * 1.0, size * 0.2, 0],
		right: [size * 1.0, size * 0.2, 0],
		top: [0, size * 1.1, 0.001], // Small Z offset to avoid Gimbal Lock
		initial: defaultCameraPosition
	});

	useTask((delta) => {
		if (targetView) {
			hasNotifiedCompletion = false;
			// Limit delta to prevent large jumps on frame drops
			const dt = Math.min(delta, 0.1);
			const lerpFactor = 1 - Math.exp(-dt * 4);

			// Interpolate ship rotation back to 0 (shortest path)
			let deltaRot = 0 - rotation;
			while (deltaRot > Math.PI) deltaRot -= Math.PI * 2;
			while (deltaRot < -Math.PI) deltaRot += Math.PI * 2;
			rotation += deltaRot * lerpFactor;

			if (camera.current) {
				const posArray = viewPositions[targetView];
				targetPos.set(posArray[0], posArray[1], posArray[2]);

				// 1. Interpolate Distance
				const currentDist = camera.current.position.distanceTo(shipCenter);
				const targetDist = targetPos.distanceTo(shipCenter);
				const newDist = currentDist + (targetDist - currentDist) * lerpFactor;

				// 2. Interpolate Direction (Spherical coordinates for smooth orbiting)
				currentDir.subVectors(camera.current.position, shipCenter).normalize();
				targetDir.subVectors(targetPos, shipCenter).normalize();

				currentSpherical.setFromVector3(currentDir);
				targetSpherical.setFromVector3(targetDir);

				// Shortest path interpolation for theta (horizontal angle)
				let deltaTheta = targetSpherical.theta - currentSpherical.theta;
				if (deltaTheta > Math.PI) deltaTheta -= Math.PI * 2;
				if (deltaTheta < -Math.PI) deltaTheta += Math.PI * 2;

				currentSpherical.theta += deltaTheta * lerpFactor;
				currentSpherical.phi += (targetSpherical.phi - currentSpherical.phi) * lerpFactor;
				currentSpherical.radius = 1;

				finalDir.setFromSpherical(currentSpherical);

				// 3. Set New Position
				camera.current.position.copy(shipCenter).add(finalDir.multiplyScalar(newDist));
				camera.current.lookAt(cameraTarget);

				// 4. Check for completion
				const distToTarget = camera.current.position.distanceTo(targetPos);
				// Ensure model is loaded and we are close to target before completing
				if ($gltf && distToTarget < 0.01 && Math.abs(rotation) < 0.001 && !hasNotifiedCompletion) {
					hasNotifiedCompletion = true;
					onTransitionComplete?.();
				}
			}
		} else if (!paused) {
			rotation = (rotation + delta * 0.5) % (Math.PI * 2);
		}
	});
</script>

<!-- Perspective Camera -->
<T.PerspectiveCamera makeDefault position={defaultCameraPosition} fov={70}>
	<OrbitControls enabled={!targetView} target={[cameraTarget.x, cameraTarget.y, cameraTarget.z]} />
</T.PerspectiveCamera>

<!-- Ambient Light for base illumination -->
<T.AmbientLight intensity={0.6} />

<!-- Key Light (main directional) -->
<T.DirectionalLight position={[15, 15, 10]} intensity={2.0} castShadow />

<!-- Fill Light (softer, opposite side) -->
<T.DirectionalLight position={[-10, 10, 15]} intensity={1.0} />

<!-- Rim Light -->
<T.DirectionalLight position={[-15, 10, -15]} intensity={1.5} />

<!-- Rotating Ship Model -->
<T.Group position={[0, verticalShift, 0]} rotation={[0, rotation, 0]}>
	{#if $gltf}
		<T is={$gltf.scene} position={[offset.x, offset.y, offset.z]} />
	{/if}
</T.Group>

{#if $gltf}
	<ContactShadows
		position.y={floorY}
		scale={size * 2}
		blur={2}
		far={size}
		opacity={0.5}
		color="#000000"
	/>

	<Grid
		position.y={floorY}
		sectionSize={size / 5}
		sectionThickness={1}
		sectionColor="#333333"
		gridSize={size * 4}
		cellSize={size / 20}
		cellThickness={0.5}
		cellColor="#222222"
		infiniteGrid
		fadeDistance={size * 3}
		fadeStrength={5}
		receiveShadow
	/>
{/if}
