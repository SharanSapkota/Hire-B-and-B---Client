export const getCurrentLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
            console.log("[v0] User location from GPS:", location)
            return location;
          },
          (error) => {
            console.error("[v0] Geolocation error:", error)
            return {
                lat: 0,
                lng: 0
            }
          }
        )
      }

      return {
        lat: 0,
        lng: 0
    }
}