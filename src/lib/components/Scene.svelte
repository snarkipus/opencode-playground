<script lang="ts">
	import { T, useThrelte, useTask } from '@threlte/core';
	import { OrbitControls, useGltf } from '@threlte/extras';
	import { Color, Vector3, Box3 } from 'three';

	interface Props {
		paused: boolean;
		targetView?: 'front' | 'back' | 'left' | 'right' | 'top' | 'initial' | null;
		onTransitionComplete?: () => void;
	}

	let { paused, targetView = null, onTransitionComplete }: Props = $props();
	let rotation = $state(0);

	let center = $state(new Vector3(0, 0, 0));
	let offset = $state(new Vector3(0, 0, 0));
	let size = $state(10);
	const verticalShift = $derived(size * 0.05);

	const { camera, scene } = useThrelte();
	const gltf = useGltf('/models/ship_pinnace1.glb');

	$effect(() => {
		if ($gltf) {
			const box = new Box3().setFromObject($gltf.scene);
			const boxCenter = new Vector3();
			box.getCenter(boxCenter);
			const boxSize = new Vector3();
			box.getSize(boxSize);

			// Auto-center the model by calculating the negative offset of its bounding box center
			offset = boxCenter.clone().multiplyScalar(-1);
			size = Math.max(boxSize.x, boxSize.y, boxSize.z);
			// We keep the target center at origin for simplicity
			center = new Vector3(0, 0, 0);
		}
	});

	const defaultCameraPosition = $derived<[number, number, number]>([size * 0.707, 0, size * 0.707]);

	const viewPositions = $derived({
		front: [0, size * 0.2, size * 1.0],
		back: [0, size * 0.2, -size * 1.0],
		left: [-size * 1.0, size * 0.2, 0],
		right: [size * 1.0, size * 0.2, 0],
		top: [0, size * 1.0, 0],
		initial: defaultCameraPosition
	});

	const visualCenter = $derived(new Vector3(0, verticalShift, 0));

	$effect(() => {
		if (scene) {
			scene.background = new Color('aliceblue');
		}
	});

	useTask((delta) => {
		if (targetView) {
			const lerpFactor = 1 - Math.exp(-delta * 5);

			// Interpolate ship rotation back to 0
			rotation += (0 - rotation) * lerpFactor;

			if (camera.current) {
				const targetPos = new Vector3(...viewPositions[targetView]);

				// 1. Interpolate Distance
				const currentDist = camera.current.position.distanceTo(visualCenter);
				const targetDist = targetPos.distanceTo(visualCenter);
				const newDist = currentDist + (targetDist - currentDist) * lerpFactor;

				// 2. Interpolate Direction (Spherical)
				const currentDir = new Vector3()
					.subVectors(camera.current.position, visualCenter)
					.normalize();
				const targetDir = new Vector3().subVectors(targetPos, visualCenter).normalize();

				// We use lerp + normalize as a fast approximation of slerp for direction vectors
				currentDir.lerp(targetDir, lerpFactor).normalize();

				// 3. Set New Position
				camera.current.position.copy(visualCenter).add(currentDir.multiplyScalar(newDist));
				camera.current.lookAt(visualCenter);

				// 4. Check for completion
				if (camera.current.position.distanceTo(targetPos) < 0.1 && Math.abs(rotation) < 0.01) {
					onTransitionComplete?.();
				}
			}
		} else if (!paused) {
			rotation += delta * 0.5;
		}
	});
</script>

<!-- Perspective Camera -->
<T.PerspectiveCamera makeDefault position={defaultCameraPosition} fov={70}>
	<OrbitControls enabled={!targetView} target={[visualCenter.x, visualCenter.y, visualCenter.z]} />
</T.PerspectiveCamera>

<!-- Ambient Light for base illumination -->
<T.AmbientLight intensity={0.6} />

<!-- Key Light (main directional) -->
<T.DirectionalLight position={[10, 10, 5]} intensity={2} />

<!-- Fill Light (softer, opposite side) -->
<T.DirectionalLight position={[-5, 5, 10]} intensity={0.8} />

<!-- Rim Light (from behind for edge highlighting) -->
<T.DirectionalLight position={[-10, 5, -10]} intensity={0.5} />

<!-- Rotating Ship Model -->
<T.Group position={[0, verticalShift, 0]} rotation={[0, rotation, 0]}>
	{#if $gltf}
		<T is={$gltf.scene} position={[offset.x, offset.y, offset.z]} />
	{/if}
</T.Group>
