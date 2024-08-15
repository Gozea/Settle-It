import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { type ViteDevServer, defineConfig } from 'vite';
import { webSocketServer } from './devserver.ts'


export default defineConfig({
	plugins: [sveltekit(), purgeCss(), webSocketServer]
});
