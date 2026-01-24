// Main dashboard component
export { default as FishingDashboard3D } from './FishingDashboard3D';

// 3D components
export { TabletModel } from './TabletModel';
export { DashboardScreen } from './DashboardScreen';
export { AROverlay } from './AROverlay';

// Panels
export { YachtNavigationPanel } from './panels/YachtNavigationPanel';
export { ForecastPanel } from './panels/ForecastPanel';
export { TideChartPanel } from './panels/TideChartPanel';
export { WeatherPanel } from './panels/WeatherPanel';
export { MarinaPanel } from './panels/MarinaPanel';
export { SolunarPanel } from './panels/SolunarPanel';

// Hooks
export { useMarineData } from './hooks/useMarineData';
export { useDeviceCapabilities, useGeolocation } from './hooks/useDeviceCapabilities';
