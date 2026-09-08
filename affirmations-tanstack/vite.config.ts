import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

// Netlify sets NETLIFY=true in its build environment. Other hosts (e.g. Render)
// get the plain Node server build in dist/server/server.js instead.
const isNetlify = !!process.env.NETLIFY

const config = defineConfig({
  plugins: [
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    ...(isNetlify ? [netlify()] : []),
  ],
})

export default config
