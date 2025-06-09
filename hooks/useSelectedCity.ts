import { useCallback, useState } from "react";

export interface City {
  id: string;
  name: string;
  region: string;
}

const DEFAULT_CITY: City = {
  id: "1",
  name: "Алматы",
  region: "Алматинская область",
};

export function useSelectedCity() {
  const [selectedCity, setSelectedCity] = useState<City>(DEFAULT_CITY);

  const updateSelectedCity = useCallback((city: City) => {
    setSelectedCity(city);
  }, []);

  const getDisplayName = useCallback(() => {
    return `Город ${selectedCity.name}`;
  }, [selectedCity.name]);

  return {
    selectedCity,
    updateSelectedCity,
    getDisplayName,
  };
}
