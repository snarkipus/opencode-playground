# 🚢 CORE-EXPLORER V1

An immersive, high-performance 3D interactive viewer for naval assets, built with the cutting edge of modern web technology.

## ✨ Features

- **Interactive 3D Navigation:** Full 6DOF exploration using OrbitControls with smooth damping and zoom.
- **Cinematic Snap-to-View:** Intelligent camera system that uses **Spherical Interpolation (Slerp)** to transition between Front, Back, Left, Right, and Top profile views without "cutting through" the model.
- **HUD Loading System:** Real-time asset tracking with a cinematic "boot-up" overlay. Monitors GLTF download progress and synchronizes UI state to the 3D scene initialization.
- **HUD-Style Interface:** A minimal, professional "Command Center" UI featuring **Glassmorphism**, high-contrast typography, and modern icons.
- **Autonomous Model Centering:** Automatically calculates bounding boxes for any GLTF model to center, scale, and focus the camera perfectly upon loading.
- **Precise Grounding:** Dynamic floor (Grid) and `ContactShadows` placement that scales with the ship's dimensions to ensure perfect visual occlusion and "grounded" presence.
- **Deep-Sea Aesthetic:** A nuanced, radial-gradient background with oceanic hues and tuned cinematic lighting (Rim, Key, and Fill).
- **Advanced Shadows:** Combines sharp real-time directional shadows with soft, high-fidelity `ContactShadows` for a "product-shot" finish.

## 🛠️ Tech Stack

- **[Svelte 5](https://svelte.dev):** Leveraging the power of **Runes** (`$state`, `$derived`, `$effect`) for ultra-efficient, fine-grained reactivity.
- **[Threlte 8](https://threlte.xyz):** A declarative, component-based Three.js wrapper for Svelte that brings 3D into the reactive graph.
- **[Tailwind CSS v4](https://tailwindcss.com):** Using the new CSS-first engine for rapid, high-performance styling.
- **[Shadcn-svelte](https://shadcn-svelte.com):** High-quality, accessible UI components built with Radix Svelte and Tailwind.
- **[@lucide/svelte](https://lucide.dev):** Using the latest Svelte 5-optimized icon package for seamless reactivity.
- **[SvelteKit](https://kit.svelte.dev):** The full-stack framework for the modern web.
- **[Three.js](https://threejs.org):** The industry-standard 3D engine.

## 🚀 Performance

Designed for **60+ FPS** performance and verified via automated audits:

- **Zero GC Pressure:** Confirmed via Playwright memory traces. All high-frequency vectors, sphericals, and matrices are pre-allocated and updated in-place during the `useTask` loop.
- **Synchronized Initialization:** The application enters a calibration phase on load, aligning camera targets and model dimensions before the HUD fades in to prevent "initial jumps."
- **Frame-rate Independence:** All camera animations are time-scaled using exponential decay, ensuring smooth movement regardless of monitor refresh rate.

## 📦 Getting Started

1. **Clone & Install:**

   ```bash
   git clone https://github.com/snarkipus/opencode-playground.git
   npm install
   ```

2. **Run Development:**

   ```bash
   npm run dev
   ```

3. **Build for Production:**
   ```bash
   npm run build
   ```

---

_Built with precision using the OpenCode Agent Framework._
