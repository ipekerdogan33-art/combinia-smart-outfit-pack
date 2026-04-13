import { Precipitation, WeatherBand } from '../types/catalog';

export type AutoWeatherContext = {
  city: string;
  latitude: number;
  longitude: number;
  temperature: number;
  maxTemperature: number;
  precipitation: number;
  weatherCode: number | null;
  weatherBand: WeatherBand;
  precipitationState: Precipitation;
  summary: string;
};

export type WeeklyWeatherDay = {
  date: string;
  dayLabel: string;
  temperature: number;
  precipitation: number;
  weatherCode: number | null;
  weatherBand: WeatherBand;
  precipitationState: Precipitation;
};

type GeocodeResult = {
  latitude: number;
  longitude: number;
  name: string;
  country?: string;
};

const DAY_LABELS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

function mapTemperatureToBand(temp: number): WeatherBand {
  if (temp < 10) return '0-10';
  if (temp < 15) return '10-15';
  if (temp < 20) return '15-20';
  if (temp < 25) return '20-25';
  return '25+';
}

function mapPrecipitationState(precipitation: number, weatherCode: number | null): Precipitation {
  if (precipitation > 0) return 'Yağışlı';
  if (weatherCode !== null && [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) {
    return 'Yağışlı';
  }
  return 'Kuru';
}

function buildSummary(temp: number, precipitationState: Precipitation, city: string) {
  return `${city} için ${Math.round(temp)}°C ve ${precipitationState.toLocaleLowerCase('tr-TR')} görünüm algılandı.`;
}

export async function geocodeCity(city: string): Promise<GeocodeResult> {
  const encoded = encodeURIComponent(city.trim());
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encoded}&count=1&language=tr&format=json`);

  if (!response.ok) {
    throw new Error('Geocoding failed');
  }

  const data = await response.json();
  const result = data?.results?.[0];

  if (!result) {
    throw new Error('City not found');
  }

  return {
    latitude: result.latitude,
    longitude: result.longitude,
    name: result.name,
    country: result.country,
  };
}

export async function fetchWeatherContextForCity(city: string): Promise<AutoWeatherContext> {
  const place = await geocodeCity(city);

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
    `&current=temperature_2m,precipitation,weather_code` +
    `&daily=temperature_2m_max,precipitation_sum` +
    `&forecast_days=1&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Weather fetch failed');
  }

  const data = await response.json();

  const currentTemp = Number(data?.current?.temperature_2m ?? 20);
  const maxTemp = Number(data?.daily?.temperature_2m_max?.[0] ?? currentTemp);
  const precipitation = Number(data?.current?.precipitation ?? data?.daily?.precipitation_sum?.[0] ?? 0);
  const weatherCode = typeof data?.current?.weather_code === 'number' ? data.current.weather_code : null;

  const effectiveTemp = Number.isFinite(maxTemp) ? maxTemp : currentTemp;
  const weatherBand = mapTemperatureToBand(effectiveTemp);
  const precipitationState = mapPrecipitationState(precipitation, weatherCode);

  return {
    city: place.name,
    latitude: place.latitude,
    longitude: place.longitude,
    temperature: currentTemp,
    maxTemperature: effectiveTemp,
    precipitation,
    weatherCode,
    weatherBand,
    precipitationState,
    summary: buildSummary(effectiveTemp, precipitationState, place.name),
  };
}

export async function fetchWeeklyWeatherForCity(city: string): Promise<WeeklyWeatherDay[]> {
  const place = await geocodeCity(city);

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
    `&daily=temperature_2m_max,precipitation_sum,weather_code` +
    `&forecast_days=7&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Weekly weather fetch failed');
  }

  const data = await response.json();

  const dates: string[] = data?.daily?.time || [];
  const temps: number[] = data?.daily?.temperature_2m_max || [];
  const precipitations: number[] = data?.daily?.precipitation_sum || [];
  const codes: number[] = data?.daily?.weather_code || [];

  return dates.map((date, index) => {
    const dt = new Date(date);
    const temperature = Number(temps[index] ?? 20);
    const precipitation = Number(precipitations[index] ?? 0);
    const weatherCode = typeof codes[index] === 'number' ? codes[index] : null;
    const weatherBand = mapTemperatureToBand(temperature);
    const precipitationState = mapPrecipitationState(precipitation, weatherCode);

    return {
      date,
      dayLabel: DAY_LABELS_TR[dt.getDay()],
      temperature,
      precipitation,
      weatherCode,
      weatherBand,
      precipitationState,
    };
  });
}
