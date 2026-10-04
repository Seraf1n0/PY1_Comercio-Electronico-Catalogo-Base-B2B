import { createContext, useContext } from "react";

export type FeedbackContextType = {
  notify: (message: string) => void;
};

export const FeedbackContext = createContext<FeedbackContextType | null>(null);

export function useCartFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error(
      "useCartFeedback se debe utilizar dentro de un CartFeedbackProvider"
    );
  }
  return context;
}
