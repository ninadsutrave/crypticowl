import { RouterProvider } from 'react-router';
import { LazyMotion, domAnimation } from 'motion/react';
import { router } from './routes';
import { DarkModeProvider } from './context/DarkModeContext';
import { AuthProvider } from './context/AuthContext';

// LazyMotion + domAnimation loads the smaller feature set (~25 KB) instead of
// the full `motion.*` feature package (~130 KB). All children use `m.*`
// primitives — `strict` would fail the build if any `motion.*` slipped back in.
export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <DarkModeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </DarkModeProvider>
    </LazyMotion>
  );
}
