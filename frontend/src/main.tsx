import { createRoot } from "react-dom/client";
import App from "./App.jsx";  // Import from ./App.tsx (your routing file)
import "./styles/index.css";
import { BrowserRouter } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
  