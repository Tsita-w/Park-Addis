const calculateDynamicPrice = (basePrice, occupancyRate) => {
  const hour = new Date().getHours();
  let multiplier = 1.0;

  // 1. Time-based Multipliers (Rush Hours)
  if (hour >= 7 && hour <= 10) multiplier += 0.5; // Morning rush
  if (hour >= 17 && hour <= 20) multiplier += 0.5; // Evening rush

  // 2. Demand-based Multipliers (Occupancy)
  if (occupancyRate > 0.9) multiplier += 1.0; // Lot nearly full
  else if (occupancyRate > 0.7) multiplier += 0.3; // High demand

  return basePrice * multiplier;
};