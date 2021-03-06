const assert = require('assert')
const axios = require('axios')

/**
 * @typedef Weather The weather.
 * @property {String} kind - The weather kind (TODO: make an exhaustive list).
 * @property {String} city - The city.
 * @property {Number} temp - The current temperature.
 * @property {Number} pressure - The current pressure.
 * @property {Number} temp_min - The minimum temperature for the current day.
 * @property {Number} temp_max - The maximum temperature for the current day.
 * @property {Number} wind_speed - The current wind speed.
 */

/**
  * @typedef OpenWeather The OpenWeather format.
  * @property {String} name - The current city name.
  * @property {Object} main - The current information.
  * @property {Number} main.temp - The current temperature.
  * @property {Number} main.pressure - The current pressure.
  * @property {Number} main.temp_min - The minimum temperature for the current day.
  * @property {Number} main.temp_max - The maximum temperature for the current day.
  * @property {Object} wind - The current wind information.
  * @property {Number} wind.speed - The current wind speed.
  * @property {Object[]} weather - A list of weathers.
  * @property {String} weather[].main - The weather name.
  */

/**
 * Factory function for the Weather service.
 */
module.exports = function WeatherService ({ logging }) {
  const logger = logging.getLogger('services.weather')
  logger.info('Creating service.')

  const API_KEY = process.env.OPEN_WEAHTER_MAP_API_KEY
  assert(
    API_KEY,
    'Environment variable "OPEN_WEAHTER_MAP_API_KEY" is required in order to use weather information'
  )

  const UNIT = process.env.OPEN_WEATHER_UNIT || 'metric'

  return {
    /**
     * Returns the current weather for the given position.
     * @param {Object} position - The position.
     * @param {Number} position.lon - The longitude.
     * @param {Number} position.lat - The latitude.
     * @returns {Promise<Weather>} - The current weather.
     */
    async getCurrentWeather ({ lon, lat }) {
      logger.debug('Calling OpenWeatherMap weather API.')
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=${API_KEY}&units=${UNIT}`
      )
      logger.debug('Done.')

      const data = response.data
      const weather = data.weather[0]

      return {
        kind: weather.main.toLowerCase(),
        city: data.name,
        temp: data.main.temp,
        pressure: data.main.pressure,
        temp_min: data.main.temp_min,
        temp_max: data.main.temp_max,
        wind_speed: data.wind.speed
      }
    },

    async getForecast ({ lon, lat }) {
      logger.debug('Calling OpenWeatherMap forecast API.')
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&APPID=${API_KEY}&units=${UNIT}`
      )
      logger.debug('Done.')

      const data = response.data
      const city = data.city.name

      return data.list.map(x => {
        return {
          city,
          date: new Date(x.dt * 1000),
          kind: x.weather[0].main.toLowerCase(),
          temp: x.main.temp,
          pressure: x.main.pressure,
          temp_min: x.main.temp_min,
          temp_max: x.main.temp_max,
          wind_speed: x.wind.speed
        }
      })
    }
  }
}
