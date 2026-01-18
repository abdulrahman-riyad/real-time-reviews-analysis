import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'
import App from './App.tsx'
import SignIn from './routes/signIn.tsx';
import SignUp from './routes/signUp.tsx';
import { AuthProvider } from './AuthProvider.tsx';


const router = createHashRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
