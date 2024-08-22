export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error.message);
          reject(new Error("Unable to retrieve your location"));
        }
      );
    } else {
      reject(new Error("Geolocation is not supported by your browser"));
    }
  });
}