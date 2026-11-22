"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type IntroState = "playing" | "lifting" | "done";

interface IntroContextType {
  introState: IntroState;
  setIntroState: (state: IntroState) => void;
  isLiftingOrDone: boolean;
  isDone: boolean;
}

const IntroContext = createContext<IntroContextType>({
  introState: "playing",
  setIntroState: () => {},
  isLiftingOrDone: false,
  isDone: false,
});

export function IntroProvider({ children }: { children: ReactNode }) {
  const [introState, setIntroState] = useState<IntroState>("playing");

  return (
    <IntroContext.Provider
      value={{
        introState,
        setIntroState,
        isLiftingOrDone: introState === "lifting" || introState === "done",
        isDone: introState === "done",
      }}
    >
      {children}
    </IntroContext.Provider>
  );
}

export function useIntro() {
  return useContext(IntroContext);
}
