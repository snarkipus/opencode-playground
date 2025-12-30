<script lang="ts">
	import { Button } from '$lib/components/ui/button/index';
	import Scene from '$lib/components/Scene.svelte';
	import { Canvas } from '@threlte/core';
	import { browser } from '$app/environment';

	let paused = $state(false);
	type View = 'front' | 'back' | 'left' | 'right' | 'top';
	let targetView = $state<View | 'initial' | null>(null);

	function togglePause() {
		paused = !paused;
		if (!paused) targetView = null;
	}

	function snapTo(view: View) {
		paused = true;
		targetView = view;
	}

	function resume() {
		targetView = 'initial';
	}

	function handleTransitionComplete() {
		if (targetView === 'initial') {
			paused = false;
		}
		targetView = null;
	}

	const views: View[] = ['front', 'back', 'left', 'right', 'top'];
</script>

<div class="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
	<h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
		Shadcn <span class="text-primary">Svelte</span>
	</h1>
	<p class="text-muted-foreground leading-7 not-first:mt-6">
		Interactive 3D Ship Demo with Threlte
	</p>
	<div class="flex gap-2">
		<Button onclick={togglePause} variant="secondary">
			{paused ? 'Resume' : 'Pause'} Rotation
		</Button>
	</div>

	{#if browser}
		<!-- 3D Scene Demo -->
		<div class="relative mt-4 h-140 w-full max-w-[800px] overflow-hidden rounded-lg border">
			<Canvas>
				<Scene {paused} {targetView} onTransitionComplete={handleTransitionComplete} />
			</Canvas>
		</div>

		<!-- Snap Controls -->
		<div class="flex flex-wrap justify-center gap-2">
			{#each views as view}
				<Button variant="outline" onclick={() => snapTo(view)}>
					{view.charAt(0).toUpperCase() + view.slice(1)}
				</Button>
			{/each}
			<Button variant="ghost" onclick={resume} disabled={!paused && !targetView}>
				Reset & Resume
			</Button>
		</div>
	{/if}
</div>
