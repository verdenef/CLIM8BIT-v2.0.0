export async function getWeather(city: string) {
  if (!city || !city.trim()) {
    throw new Error('City name is required');
  }

  const response = await fetch(`/api/weather?city=${encodeURIComponent(city.trim())}`);
  if (!response.ok) {
    // Try to parse error response from backend
    let errorMessage = 'Failed to fetch weather';
    try {
      const errorData = await response.json();
      // Check for specific error messages
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
      
      // Check for city not found / invalid city errors (OpenWeather API returns 404 or 400)
      if (response.status === 404 || errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('city not found')) {
        errorMessage = `City not found: ${city}`;
      } else if (response.status === 400 && errorMessage.toLowerCase().includes('invalid')) {
        errorMessage = `Invalid city: ${city}`;
      } else if (response.status >= 500) {
        errorMessage = 'Weather service unavailable. Please try again later.';
      } else if (response.status === 0 || errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
        errorMessage = 'Network connection error. Please check your internet connection.';
      }
    } catch (e) {
      // If we can't parse the error, use a default message based on status
      if (response.status === 404) {
        errorMessage = `City not found: ${city}`;
      } else if (response.status >= 500) {
        errorMessage = 'Weather service unavailable. Please try again later.';
      } else if (response.status === 0) {
        errorMessage = 'Network connection error. Please check your internet connection.';
      }
    }

    // Tag error types so ErrorBanner can categorize accurately
    const lower = errorMessage.toLowerCase();
    let taggedMessage = errorMessage;
    if (
      response.status === 404 ||
      lower.includes('city not found') ||
      lower.includes('invalid city')
    ) {
      taggedMessage = `[CITY_ERROR] ${errorMessage}`;
    } else if (
      response.status === 0 ||
      lower.includes('network connection') ||
      lower.includes('network')
    ) {
      taggedMessage = `[NETWORK_ERROR] ${errorMessage}`;
    } else if (
      response.status >= 500 ||
      lower.includes('service unavailable') ||
      lower.includes('service is experiencing')
    ) {
      taggedMessage = `[SERVICE_ERROR] ${errorMessage}`;
    }

    throw new Error(taggedMessage);
  }
  return response.json();
}

export async function getWeatherByCoords(lat: number, lon: number) {
  if (lat == null || lon == null || isNaN(lat) || isNaN(lon)) {
    throw new Error('Invalid coordinates');
  }

  const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
  if (!response.ok) {
    // Try to parse error response from backend
    let errorMessage = 'Failed to fetch weather';
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
      
      if (response.status >= 500) {
        errorMessage = 'Weather service unavailable. Please try again later.';
      } else if (response.status === 0 || errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
        errorMessage = 'Network connection error. Please check your internet connection.';
      }
    } catch (e) {
      if (response.status >= 500) {
        errorMessage = 'Weather service unavailable. Please try again later.';
      } else if (response.status === 0) {
        errorMessage = 'Network connection error. Please check your internet connection.';
      }
    }

    // Tag error types for coordinate-based lookups
    const lower = errorMessage.toLowerCase();
    let taggedMessage = errorMessage;
    if (
      response.status === 0 ||
      lower.includes('network connection') ||
      lower.includes('network')
    ) {
      taggedMessage = `[NETWORK_ERROR] ${errorMessage}`;
    } else if (
      response.status >= 500 ||
      lower.includes('service unavailable') ||
      lower.includes('service is experiencing')
    ) {
      taggedMessage = `[SERVICE_ERROR] ${errorMessage}`;
    }

    throw new Error(taggedMessage);
  }
  return response.json();
}

export async function getForecast(city: string) {
  if (!city || !city.trim()) {
    throw new Error('City name is required');
  }

  const response = await fetch(`/api/forecast?city=${encodeURIComponent(city.trim())}`);
  if (!response.ok) {
    // Try to parse error response from backend
    let errorMessage = 'Failed to fetch forecast';
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
      
      if (response.status === 404 || errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('city not found')) {
        errorMessage = `City not found: ${city}`;
      } else if (response.status >= 500) {
        errorMessage = 'Weather service unavailable. Please try again later.';
      } else if (response.status === 0 || errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
        errorMessage = 'Network connection error. Please check your internet connection.';
      }
    } catch (e) {
      if (response.status === 404) {
        errorMessage = `City not found: ${city}`;
      } else if (response.status >= 500) {
        errorMessage = 'Weather service unavailable. Please try again later.';
      } else if (response.status === 0) {
        errorMessage = 'Network connection error. Please check your internet connection.';
      }
    }

    // Tag error types so ErrorBanner can categorize forecast errors
    const lower = errorMessage.toLowerCase();
    let taggedMessage = errorMessage;
    if (
      response.status === 404 ||
      lower.includes('city not found') ||
      lower.includes('invalid city')
    ) {
      taggedMessage = `[CITY_ERROR] ${errorMessage}`;
    } else if (
      response.status === 0 ||
      lower.includes('network connection') ||
      lower.includes('network')
    ) {
      taggedMessage = `[NETWORK_ERROR] ${errorMessage}`;
    } else if (
      response.status >= 500 ||
      lower.includes('service unavailable') ||
      lower.includes('service is experiencing')
    ) {
      taggedMessage = `[SERVICE_ERROR] ${errorMessage}`;
    }

    throw new Error(taggedMessage);
  }
  return response.json();
}

export async function getCurrentLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        }),
      (error) => reject(error)
    );
  });
}


