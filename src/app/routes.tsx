import { createBrowserRouter } from 'react-router';
import { Root } from './pages/Root';
import { Puzzle } from './pages/Puzzle';

// Root layout + the index route (Puzzle) ship in the initial bundle because
// they are rendered on first paint. All other pages are code-split so they
// only load when the user navigates to them — big win for LCP/TBT on `/`.
export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Puzzle },
      { path: 'puzzle', Component: Puzzle },
      { path: 'puzzle/:number', Component: Puzzle },
      {
        path: 'about',
        lazy: async () => ({ Component: (await import('./pages/Home')).Home }),
      },
      {
        path: 'learn',
        lazy: async () => ({ Component: (await import('./pages/Learn')).Learn }),
      },
      {
        path: 'history',
        lazy: async () => ({ Component: (await import('./pages/History')).Progress }),
      },
      {
        path: 'privacy',
        lazy: async () => ({ Component: (await import('./pages/Privacy')).Privacy }),
      },
      {
        path: 'submit',
        lazy: async () => ({ Component: (await import('./pages/SubmitClue')).SubmitClue }),
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('./pages/NotFound')).NotFound }),
      },
    ],
  },
]);
