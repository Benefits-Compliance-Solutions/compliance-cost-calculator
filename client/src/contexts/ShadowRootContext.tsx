import * as React from "react";

interface ShadowRootContextValue {
  shadowRoot: ShadowRoot | null;
  container: HTMLElement | null;
}

const ShadowRootContext = React.createContext<ShadowRootContextValue>({
  shadowRoot: null,
  container: null,
});

export function ShadowRootProvider({
  shadowRoot,
  container,
  children,
}: {
  shadowRoot: ShadowRoot | null;
  container: HTMLElement | null;
  children: React.ReactNode;
}) {
  const value = React.useMemo(
    () => ({ shadowRoot, container }),
    [shadowRoot, container]
  );
  return (
    <ShadowRootContext.Provider value={value}>
      {children}
    </ShadowRootContext.Provider>
  );
}

export function useShadowRoot() {
  return React.useContext(ShadowRootContext);
}

export default ShadowRootContext;
