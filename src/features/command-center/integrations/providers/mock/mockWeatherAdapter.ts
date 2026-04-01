import type { WeatherAdapter } from "../../adapters/types";
export const mockWeatherAdapter: WeatherAdapter = { async getForecast() { return { summary: "Clear" }; } };
