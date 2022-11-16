import { computeHeading, LatLng } from "spherical-geometry-js";

export const calculateDirection = (
  lat1: number,
  long1: number,
  lat2: number,
  long2: number
) => {
  const bearing = calculateBearing(lat1, long1, lat2, long2);
  // console.log("bearing", bearing);
  const direction = bearingToDirection(bearing);
  // console.log("direction", direction);

  return direction;
};

const calculateBearing = (
  lat1: number,
  long1: number,
  lat2: number,
  long2: number
): number => {
  const point1 = new LatLng(lat1, long1);
  const point2 = new LatLng(lat2, long2);
  const bearing = computeHeading(point1, point2);

  return bearing;
};

const bearingToDirection = (bearing: number): string => {
  if (bearing >= -45 && bearing <= 45) {
    return "NORTH";
  } else if (
    (bearing <= -135 && bearing >= -180) ||
    (bearing >= 135 && bearing <= 180)
  ) {
    return "SOUTH";
  } else if (bearing < 0) {
    return "WEST";
  } else if (bearing > 0) {
    return "EAST";
  } else {
    return "OH GOD WHERE ARE WE?";
  }
};
