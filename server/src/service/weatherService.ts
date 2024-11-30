import dotenv from 'dotenv';
dotenv.config();

interface Coordinates {
  lat: number;
  lon: number;
}

class Weather {
  city?: string; // .city.name
  date?: Date; // .list[i].dt or dt_txt
  icon?: string; // .list[i].weather.icon
  iconDescription?: string // .list[i].weather.description
  tempF?: number // .list[i].main.temp
  windSpeed?: number // .list[i].wind.speed
  humidity?: number // .list[i].main.humidity
}

class WeatherService {
  private baseURL?: string;
  private apiKey?: string;
  private cityName?: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
    console.log('baseURL', this.baseURL);
    console.log('apiKey', this.apiKey);
  }

  private async fetchLocationData(query: string) {
    try {
      const response = await fetch(
        `${this.baseURL}/geo/1.0/direct?${query}`
      );
      const locationData = await response.json();
      return locationData[0];
    } catch (err) {
      console.log('Error:', err);
      return err;
    }
  }

  private destructureLocationData(locationData: Coordinates): Coordinates {
    return {
      lat: locationData.lat,
      lon: locationData.lon,
    }
  }

  private buildGeocodeQuery(): string {
    return `q=${this.cityName}&limit=1&appid=${this.apiKey}`
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    return `lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`
  }

  private async fetchAndDestructureLocationData() {
    try {
      const geocodeQuery = this.buildGeocodeQuery(); // "q=London&limit=1&appid=9cb9769e378cee1b41b6561c36374bc8"
      const locationData = await this.fetchLocationData(geocodeQuery);
      const coordinates = this.destructureLocationData(locationData);
      return coordinates;
    } catch (err) {
      return err;
    }
  }

  private async fetchWeatherData(coordinates: Coordinates) {
    const query = this.buildWeatherQuery(coordinates);
    try {
      const response = await fetch(
        `${this.baseURL}/data/2.5/forecast?${query}`
      )
      const weatherData = await response.json();
      return weatherData;
    } catch (err) {
      console.log('Error:', err);
      return err;
    }
  }

  private parseCurrentWeather(response: any): Weather {
    const currentWeather = response.list[0];
    return {
      city: response.city.name,
      date: currentWeather.dt,
      icon: currentWeather.weather.icon,
      iconDescription: currentWeather.weather.description,
      tempF: currentWeather.main.temp,
      windSpeed: currentWeather.wind.speed,
      humidity: currentWeather.main.humidity,
    }
  }

  private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
    const futureWeather = weatherData.map(weather => ({
      date: weather.dt,
      icon: weather.weather.icon,
      iconDescription: weather.weather.description,
      tempF: weather.main.temp,
      windSpeed: weather.wind.speed,
      humidity: weather.main.humidity,
    }));
    return [currentWeather].concat(futureWeather);
  }
  async getWeatherForCity(city: string) {
    this.cityName = city;
    try {
      const coordinates = await this.fetchAndDestructureLocationData();
      const weatherData = await this.fetchWeatherData(coordinates as any);
      const weather = this.parseCurrentWeather(weatherData);
      const forcastArray = this.buildForecastArray(weather, weatherData.list);
      return forcastArray;
    } catch (err) {
      return err;
    }
  }
}

export default new WeatherService();
