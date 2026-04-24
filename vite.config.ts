import { defineConfig, type Plugin } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

/**
 * Inline the main CSS bundle into `<style>` inside the HTML so the browser
 * doesn't have to make a second round-trip before it can paint. Lighthouse
 * was flagging the 15 KB `index-*.css` as a 300 ms render-blocking request
 * on mobile; inlining it drops that cost to zero.
 */
function inlineCss(): Plugin {
  return {
    name: 'inline-css',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const bundle = ctx.bundle;
        if (!bundle) return html;
        for (const [fileName, asset] of Object.entries(bundle)) {
          if (asset.type !== 'asset' || !fileName.endsWith('.css')) continue;
          const css = typeof asset.source === 'string' ? asset.source : asset.source.toString();
          // Strip the <link rel="stylesheet"> for this file + inline the CSS.
          const linkRe = new RegExp(
            `<link\\s+rel="stylesheet"[^>]*href="[^"]*${fileName.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}"[^>]*>`,
            'g'
          );
          html = html.replace(linkRe, `<style>${css}</style>`);
        }
        return html;
      },
    },
  };
}

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    inlineCss(),
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
