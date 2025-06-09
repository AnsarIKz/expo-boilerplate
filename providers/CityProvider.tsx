import { City, useSelectedCity } from "@/hooks/useSelectedCity";
import { createContext, ReactNode, useContext } from "react";

interface CityContextType {
  selectedCity: City;
  updateSelectedCity: (city: City) => void;
  getDisplayName: () => string;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

interface CityProviderProps {
  children: ReactNode;
}

export function CityProvider({ children }: CityProviderProps) {
  const cityState = useSelectedCity();

  return (
    <CityContext.Provider value={cityState}>{children}</CityContext.Provider>
  );
}

export function useCityContext() {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error("useCityContext must be used within a CityProvider");
  }
  return context;
}
