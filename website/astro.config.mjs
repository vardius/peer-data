// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	site: 'https://vardius.github.io',
	base: '/peer-data',
	trailingSlash: 'always',
	vite: {
		// The live demo runs the library from ../src and the examples from ../examples, as their tests do.
		resolve: { alias: { 'peer-data': fileURLToPath(new URL('../src/index.ts', import.meta.url)) } },
		// Pages import the runnable examples in ../examples, so the dev server may read outside this folder.
		server: { fs: { allow: ['..'] } },
	},
	integrations: [
		starlight({
			title: 'peer-data',
			description:
				'WebRTC rooms for the browser: send data and share media straight from one peer to the others, over the signaling you choose.',
			logo: { src: './src/assets/mark.svg', alt: '' },
			favicon: '/favicon.svg',
			components: { Hero: './src/components/Hero.astro' },
			// Long lines wrap instead of scrolling under the copy button on phones.
			expressiveCode: { defaultProps: { wrap: true } },
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/vardius/peer-data' }],
			customCss: ['./src/styles/custom.css'],
			sidebar: [
				{
					label: 'Start here',
					items: ['getting-started', 'demo'],
				},
				{
					label: 'Guides',
					items: ['rooms', 'data', 'media', 'signaling', 'vite', 'examples'],
				},
				{
					label: 'Reference',
					items: ['api', 'migrating-from-v3', 'changelog'],
				},
			],
		}),
	],
});
