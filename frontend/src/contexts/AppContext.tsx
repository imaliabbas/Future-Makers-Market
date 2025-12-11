"use client";

import React, { createContext, useContext, ReactNode } from "react";

// AppContext is now largely deprecated as we have moved to React Query + Real API.
// We are keeping it minimal or removing it entirely if not needed.
// For now, we can remove the state and just keep it as a placeholder or remove it from the tree.
// Since AuthContext handles user state, and other data is fetched via hooks, AppContext is redundant.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AppContext = createContext<any>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AppContext.Provider value={{}}>
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => {
  return useContext(AppContext);
};