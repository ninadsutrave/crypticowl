import { createBrowserRouter } from 'react-router';
import { Root } from './pages/Root';
import { Home } from './pages/Home';
import { Learn } from './pages/Learn';
import { Puzzle } from './pages/Puzzle';
import { Progress } from './pages/History';
import { Privacy } from './pages/Privacy';
import { NotFound } from './pages/NotFound';
import { SubmitClue } from './pages/SubmitClue';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Puzzle },
      { path: 'about', Component: Home },
      { path: 'learn', Component: Learn },
      { path: 'puzzle', Component: Puzzle },
      { path: 'puzzle/:number', Component: Puzzle },
      { path: 'history', Component: Progress },
      { path: 'privacy', Component: Privacy },
      { path: 'submit', Component: SubmitClue },
      { path: '*', Component: NotFound },
    ],
  },
]);
