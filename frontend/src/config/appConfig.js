const requestedSource = String(import.meta.env.VITE_DATA_SOURCE || "mock").toLowerCase();

export const appConfig = Object.freeze({
  dataSource: requestedSource === "api" ? "api" : "mock",
  apiUrl: String(import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api").replace(/\/$/, ""),
  mockLatency: Math.max(0, Number(import.meta.env.VITE_MOCK_LATENCY || 180)),
});

export const isMockMode = appConfig.dataSource === "mock";
export const isApiMode = appConfig.dataSource === "api";
