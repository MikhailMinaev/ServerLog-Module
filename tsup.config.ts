import { defineConfig } from 'tsup';

export default defineConfig({
	format: ['cjs', 'esm'],
	entry: ['./source/index.ts'],
	outDir: './build',
	dts: true,
	shims: true,
	clean: true,
	// bundle: true,
	minify: true,
	keepNames: true,
});