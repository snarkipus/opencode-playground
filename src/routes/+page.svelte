<script lang="ts">
	import { Button } from '$lib/components/ui/button/index';
	import Scene from '$lib/components/Scene.svelte';
	import { Canvas } from '@threlte/core';
	import { browser } from '$app/environment';
	import { WebGLRenderer } from 'three';
	import { Pause, Play, RefreshCw, ChevronRight, Info, MousePointer2 } from 'lucide-svelte';

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

<main class="selection:bg-primary/30 relative h-screen w-full overflow-hidden text-white">
	{#if browser}
		<div class="absolute inset-0 z-0">
			<Canvas
				createRenderer={(canvas) => new WebGLRenderer({ canvas, antialias: true, alpha: true })}
			>
				<Scene {paused} {targetView} onTransitionComplete={handleTransitionComplete} />
			</Canvas>
		</div>

		<!-- UI Overlay -->
		<div
			class="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-6 lg:p-10"
		>
			<!-- Top Header -->
			<div class="flex items-start justify-between">
				<div class="pointer-events-auto flex flex-col gap-1">
					<div class="flex items-center gap-2 text-sm font-medium text-white/50">
						<span>ASSETS</span>
						<ChevronRight class="size-3" />
						<span class="tracking-wider text-white/90 uppercase">Pinnace Class</span>
					</div>
					<h1 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
						CORE-EXPLORER <span class="text-primary/80">V1</span>
					</h1>
				</div>

				<div class="pointer-events-auto flex gap-2">
					<div class="glass flex items-center gap-1 rounded-full p-1">
						<Button
							variant="ghost"
							size="icon"
							onclick={togglePause}
							class="rounded-full hover:bg-white/10"
							title={paused ? 'Resume Rotation' : 'Pause Rotation'}
						>
							{#if paused}
								<Play class="size-4 fill-current" />
							{:else}
								<Pause class="size-4 fill-current" />
							{/if}
						</Button>
						<div class="mx-1 h-4 w-px bg-white/10"></div>
						<Button
							variant="ghost"
							size="icon"
							onclick={resume}
							disabled={!paused && !targetView}
							class="rounded-full hover:bg-white/10"
							title="Reset View & Resume"
						>
							<RefreshCw class="size-4" />
						</Button>
					</div>
				</div>
			</div>

			<!-- Bottom Section -->
			<div class="flex flex-col items-center gap-6">
				<!-- View Controls Dock -->
				<div
					class="glass pointer-events-auto flex gap-1 rounded-2xl p-1.5 transition-all hover:border-white/20"
				>
					{#each views as view (view)}
						<Button
							variant={targetView === view ? 'secondary' : 'ghost'}
							size="sm"
							onclick={() => snapTo(view)}
							class="h-9 rounded-xl px-4 text-xs font-semibold tracking-widest uppercase transition-all"
						>
							{view}
						</Button>
					{/each}
				</div>

				<!-- Footer Info -->
				<div class="flex w-full items-end justify-between">
					<div
						class="glass flex items-center gap-3 rounded-xl px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase"
					>
						<Info class="size-3" />
						<span>Pinnace-class light transport / scouting vessel</span>
					</div>

					<div
						class="glass flex items-center gap-3 rounded-xl px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase"
					>
						<MousePointer2 class="size-3" />
						<span>Left click to orbit / Scroll to zoom</span>
					</div>
				</div>
			</div>
		</div>
	{/if}
</main>

<style>
</style>
