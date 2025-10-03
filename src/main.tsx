import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/responsive-viewport.css";

createRoot(document.getElementById("root")!).render(<App />);
