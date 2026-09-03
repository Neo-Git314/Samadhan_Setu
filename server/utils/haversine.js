/**
 * Calculates the Haversine distance in kilometers between two coordinates.
 * @param {{ lat: number, lng: number }} coord1
 * @param {{ lat: number, lng: number }} coord2
 * @returns {number} distance in kilometers
 */
export function haversine(coord1, coord2) {
  if (!coord1 || !coord2) return 0;
  
  const lat1 = Number(coord1.lat) || 0;
  const lon1 = Number(coord1.lng) || 0;
  const lat2 = Number(coord2.lat) || 0;
  const lon2 = Number(coord2.lng) || 0;

  const R = 6371; // Earth's radius in km
  const toRad = (angle) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default haversine;
