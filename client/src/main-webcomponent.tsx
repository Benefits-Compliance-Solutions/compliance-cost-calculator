import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ShadowRootProvider } from "./contexts/ShadowRootContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import "./index.css";

declare global {
  interface Window {
    __COMPLIANCE_CALCULATOR_STYLES__?: string;
  }
}

interface WebComponentAppProps {
  shadowRoot: ShadowRoot;
  container: HTMLElement;
}

function WebComponentApp({ shadowRoot, container }: WebComponentAppProps) {
  return (
    <ErrorBoundary>
      <ShadowRootProvider shadowRoot={shadowRoot} container={container}>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider delayDuration={200}>
            <Toaster />
            <Home />
          </TooltipProvider>
        </ThemeProvider>
      </ShadowRootProvider>
    </ErrorBoundary>
  );
}

function processCSSForShadowDOM(css: string): string {
  return css
    .replace(/:root\s*\{/g, ":host {")
    .replace(/:root(?=[^{]*\{)/g, ":host");
}

function getStyles(): string {
  return window.__COMPLIANCE_CALCULATOR_STYLES__ || "";
}

class ComplianceCalculator extends HTMLElement {
  private root: ReturnType<typeof createRoot> | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (!this.shadowRoot) return;

    const shadowRoot = this.shadowRoot;

    // Get styles from the injected style element and process for Shadow DOM
    const styles = getStyles();
    const processedStyles = processCSSForShadowDOM(styles);
    const styleSheet = document.createElement("style");
    styleSheet.textContent = processedStyles;
    shadowRoot.appendChild(styleSheet);

    // Add Google Fonts link
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap";
    shadowRoot.appendChild(fontLink);

    // Create mount point for React
    const mountPoint = document.createElement("div");
    mountPoint.id = "root";
    mountPoint.style.width = "100%";
    mountPoint.style.height = "100%";
    shadowRoot.appendChild(mountPoint);

    // Render React app with shadow root context
    this.root = createRoot(mountPoint);
    this.root.render(
      <WebComponentApp shadowRoot={shadowRoot} container={mountPoint} />
    );
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}

customElements.define("compliance-calculator", ComplianceCalculator);
