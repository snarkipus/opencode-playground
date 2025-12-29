<script lang="ts">
	import { Button } from '$lib/components/ui/button/index';
	import Scene from '$lib/components/Scene.svelte';
	import { Canvas } from '@threlte/core';
	import { browser } from '$app/environment';

	let paused = $state(false);

	function togglePause() {
		paused = !paused;
	}
</script>

<div class="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
	<h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
		Shadcn <span class="text-primary">Svelte</span>
	</h1>
	<p class="text-muted-foreground leading-7 not-first:mt-6">
		Interactive 3D Ship Demo with Threlte
	</p>
	<Button onclick={togglePause}>
		{paused ? 'Resume' : 'Pause'} Rotation
	</Button>

	{#if browser}
		<!-- 3D Scene Demo -->
		<div class="relative mt-4 h-140 w-full overflow-hidden rounded-lg border">
			<Canvas>
				<Scene {paused} />
			</Canvas>
		</div>
	{/if}
</div>
