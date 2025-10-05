import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ShortcutConfig {
  onSearch?: () => void;
  onToggleSidebar?: () => void;
  onShowHelp?: () => void;
}

export const useKeyboardShortcuts = (config: ShortcutConfig = {}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        config.onSearch?.();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        config.onToggleSidebar?.();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        config.onShowHelp?.();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "h") {
        e.preventDefault();
        navigate("/");
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        navigate("/dashboard");
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        navigate("/profile");
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "a" && e.shiftKey) {
        e.preventDefault();
        navigate("/applications");
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "w") {
        e.preventDefault();
        navigate("/wishlist");
      }

      if (e.key === "Escape") {
        const openDialog = document.querySelector('[role="dialog"]');
        if (openDialog) {
          const closeButton = openDialog.querySelector('[aria-label="Close"]');
          if (closeButton instanceof HTMLElement) {
            closeButton.click();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigate, config]);
};

export const shortcuts = [
  { keys: ["Ctrl", "K"], description: "Open search" },
  { keys: ["Ctrl", "B"], description: "Toggle sidebar" },
  { keys: ["Ctrl", "/"], description: "Show shortcuts" },
  { keys: ["Ctrl", "H"], description: "Go to home" },
  { keys: ["Ctrl", "D"], description: "Go to dashboard" },
  { keys: ["Ctrl", "P"], description: "Go to profile" },
  { keys: ["Ctrl", "Shift", "A"], description: "Go to applications" },
  { keys: ["Ctrl", "W"], description: "Go to wishlist" },
  { keys: ["Esc"], description: "Close modals" },
];
