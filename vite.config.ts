import { defineConfig } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    // Source maps help debugging in production and satisfy the Lighthouse
    // "Missing source maps for large first-party JavaScript" diagnostic.
    // Source map files are only fetched when DevTools is open, so zero cost
    // for regular users.
    sourcemap: true,
    // Split big third-party deps into their own cacheable chunks, so the
    // initial JS payload stays lean and upgrades don't bust the whole cache.
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'supabase': ['@supabase/supabase-js'],
          'motion': ['motion', 'motion/react'],
          'icons': ['lucide-react'],
        },
      },
    },
    // Slightly lower chunk warning threshold so we notice future bloat.
    chunkSizeWarningLimit: 600,
  },
});
