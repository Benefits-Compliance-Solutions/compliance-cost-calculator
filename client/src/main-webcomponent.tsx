import { createRoot } from "react-dom/client";
import App from "./App";
// @ts-expect-error - Vite's ?inline import for CSS as string
import styles from "./index.css?inline";

class ComplianceCalculator extends HTMLElement {
  private root: ReturnType<typeof createRoot> | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (!this.shadowRoot) return;

    // Inject styles into shadow DOM
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    this.shadowRoot.appendChild(styleSheet);

    // Add Google Fonts link
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap";
    this.shadowRoot.appendChild(fontLink);

    // Create mount point for React
    const mountPoint = document.createElement("div");
    mountPoint.id = "root";
    mountPoint.style.width = "100%";
    mountPoint.style.height = "100%";
    this.shadowRoot.appendChild(mountPoint);

    // Render React app
    this.root = createRoot(mountPoint);
    this.root.render(<App />);
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}

customElements.define("compliance-calculator", ComplianceCalculator);
