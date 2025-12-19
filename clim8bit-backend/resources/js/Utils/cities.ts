// Popular cities for autocomplete
export const popularCities = [
  // Major global cities
  "Abu Dhabi, AE",
  "Amsterdam, NL",
  "Athens, GR",
  "Atlanta, US",
  "Auckland, NZ",
  "Bangalore, IN",
  "Bangkok, TH",
  "Barcelona, ES",
  "Beirut, LB",
  "Beijing, CN",
  "Berlin, DE",
  "Birmingham, GB",
  "Bogotá, CO",
  "Boston, US",
  "Brisbane, AU",
  "Brussels, BE",
  "Budapest, HU",
  "Buenos Aires, AR",
  "Busan, KR",
  "Cairo, EG",
  "Calgary, CA",
  "Cape Town, ZA",
  "Chicago, US",
  "Cologne, DE",
  "Copenhagen, DK",
  "Dallas, US",
  "Delhi, IN",
  "Denver, US",
  "Doha, QA",
  "Dublin, IE",
  "Dubai, AE",
  "Edinburgh, GB",
  "Florence, IT",
  "Frankfurt, DE",
  "Fukuoka, JP",
  "Geneva, CH",
  "Glasgow, GB",
  "Hamburg, DE",
  "Helsinki, FI",
  "Hong Kong, HK",
  "Houston, US",
  "Istanbul, TR",
  "Jakarta, ID",
  "Johannesburg, ZA",
  "Kuala Lumpur, MY",
  "Kuwait City, KW",
  "Kyoto, JP",
  "Lagos, NG",
  "Las Vegas, US",
  "Lima, PE",
  "Lisbon, PT",
  "Liverpool, GB",
  "London, GB",
  "Los Angeles, US",
  "Lyon, FR",
  "Madrid, ES",
  "Manchester, GB",
  "Marseille, FR",
  "Melbourne, AU",
  "Mexico City, MX",
  "Miami, US",
  "Milan, IT",
  "Montreal, CA",
  "Moscow, RU",
  "Mumbai, IN",
  "Munich, DE",
  "Nairobi, KE",
  "Naples, IT",
  "New York, US",
  "Nice, FR",
  "Oslo, NO",
  "Osaka, JP",
  "Ottawa, CA",
  "Paris, FR",
  "Philadelphia, US",
  "Phoenix, US",
  "Prague, CZ",
  "Rio de Janeiro, BR",
  "Riyadh, SA",
  "Rome, IT",
  "San Diego, US",
  "San Francisco, US",
  "Santiago, CL",
  "São Paulo, BR",
  "Seattle, US",
  "Seoul, KR",
  "Shanghai, CN",
  "Singapore, SG",
  "Stockholm, SE",
  "Sydney, AU",
  "Tel Aviv, IL",
  "Tokyo, JP",
  "Toronto, CA",
  "Vancouver, CA",
  "Venice, IT",
  "Vienna, AT",
  "Warsaw, PL",
  "Washington, US",
  "Yokohama, JP",
  "Zurich, CH",

  // Philippine cities
  "Bacolod, PH",
  "Baguio, PH",
  "Bislig, PH",
  "Butuan City, PH",
  "Cagayan de Oro, PH",
  "Caloocan, PH",
  "Cebu City, PH",
  "Davao City, PH",
  "Iloilo City, PH",
  "Makati, PH",
  "Mandaluyong, PH",
  "Manila, PH",
  "Pasig, PH",
  "Quezon City, PH",
  "Taguig, PH",
  "Tandag, PH",
  "Zamboanga City, PH",
];

export function searchCities(query: string): string[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();

  // Filter cities that start with the query
  const startsWithMatches = popularCities.filter((city) =>
    city.toLowerCase().startsWith(normalizedQuery),
  );

  // Filter cities that contain the query (but don't start with it)
  const containsMatches = popularCities.filter((city) => {
    const lowerCity = city.toLowerCase();
    return (
      lowerCity.includes(normalizedQuery) &&
      !lowerCity.startsWith(normalizedQuery)
    );
  });

  // Combine results: prioritize cities that start with query
  return [...startsWithMatches, ...containsMatches].slice(0, 8);
}

