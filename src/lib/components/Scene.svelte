<script lang="ts">
	import { T, useThrelte, useTask } from '@threlte/core';
	import { OrbitControls, useGltf } from '@threlte/extras';
	import { Color } from 'three';

	interface Props {
		paused: boolean;
	}

	let { paused }: Props = $props();
	let rotation = $state(0);

	const { camera, scene } = useThrelte();
	const gltf = useGltf('/models/ship_pinnace1.glb');

	$effect(() => {
		if (camera.current) {
			camera.current.lookAt(0, 0, 0);
		}
		if (scene) {
			scene.background = new Color('aliceblue');
		}
	});

	useTask((delta) => {
		if (!paused) {
			rotation += delta * 0.5;
		}
	});
</script>

<!-- Perspective Camera -->
<T.PerspectiveCamera makeDefault position={[20, 5, 20]} fov={70}>
	<OrbitControls target={[0, 0, 0]} />
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
{#if $gltf}
	<T is={$gltf.scene} position={[0, -10, 0]} rotation={[0, rotation, 0]} />
{/if}
