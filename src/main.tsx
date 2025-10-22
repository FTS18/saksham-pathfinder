import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/card-grid.css";
import "./utils/themeInitializer";

// Initialize theme before rendering to prevent flash
const root = createRoot(document.getElementById("root")!);
root.render(<App />);

requestAnimationFrame(() => {
	const skeleton = document.getElementById("initial-skeleton");
	if (skeleton) {
		skeleton.remove();
	}
});
