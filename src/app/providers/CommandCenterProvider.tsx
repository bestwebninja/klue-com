import { ReactNode, createContext, useContext } from "react";

const CommandCenterContext = createContext({ alphaEnabled: true });

export function CommandCenterProvider({ children }: { children: ReactNode }) {
  return <CommandCenterContext.Provider value={{ alphaEnabled: true }}>{children}</CommandCenterContext.Provider>;
}

export function useCommandCenterProvider() {
  return useContext(CommandCenterContext);
}
