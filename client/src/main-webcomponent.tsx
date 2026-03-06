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
  // Replace `:root` with `:host` for Tailwind variables.
  // Tailwind v4 sometimes uses `:root` or minified `body,:host` or `body{`
  return css
    .replace(/:root/g, ":host")
    .replace(/body\s*\{/g, "body, :host {")
    .replace(/body\s*,/g, "body, :host,")
    .replace(/body,:host\{/g, "body, :host {")
    .replace(/body\{/g, "body, :host {")
    .replace(/html,:host\{/g, "html, :host {")
    .replace(/html\{/g, "html, :host {");
}

function getStyles(): string {
  return window.__COMPLIANCE_CALCULATOR_STYLES__ || "";
}

function applyStylesToShadowRoot(shadowRoot: ShadowRoot, css: string) {
  const processedStyles = processCSSForShadowDOM(css);

  if (
    "adoptedStyleSheets" in shadowRoot &&
    "replaceSync" in CSSStyleSheet.prototype
  ) {
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(processedStyles);
    shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, styleSheet];
    return;
  }

  const styleElement = document.createElement("style");
  styleElement.textContent = processedStyles;
  shadowRoot.appendChild(styleElement);
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
    const styles = getStyles();

    if (styles) {
      applyStylesToShadowRoot(shadowRoot, styles);
    }

    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap";
    shadowRoot.appendChild(fontLink);

    const mountPoint = document.createElement("div");
    mountPoint.id = "root";
    mountPoint.style.width = "100%";
    mountPoint.style.height = "100%";
    mountPoint.style.minHeight = "100vh";
    mountPoint.style.backgroundColor = "oklch(0.98 0.005 240)";
    mountPoint.style.color = "oklch(0.20 0.02 280)";
    mountPoint.style.fontFamily = "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    shadowRoot.appendChild(mountPoint);

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
