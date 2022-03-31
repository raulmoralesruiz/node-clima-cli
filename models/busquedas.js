require("dotenv").config();
const { default: axios } = require("axios");

class Busquedas {
  historial = [];

  constructor() {
    // TODO: leer DB si existe
  }

  async ciudad(lugar = "") {
    try {
      // peticion http
      const instance = axios.create({
        baseURL: `https://nominatim.openstreetmap.org/search`,
        params: {
          q: `${lugar}`,
          format: "jsonv2",
          addressdetails: 1,
          limit: 5,
        },
      });

      const resp = await instance.get();
      return resp.data.map((lugar) => ({
        id: lugar.place_id,
        nombre: lugar.display_name,
        lng: lugar.lon,
        lat: lugar.lat,
      }));
    } catch (error) {
      return [];
    }
  }

  get weatherParams() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: "metric",
      lang: "es",
    };
  }

  async climaLugar(lat, lon) {
    try {
      // crear instancia axios.create()
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: { ...this.weatherParams, lat, lon },
      });

      // extraer info de resp.data
      const resp = await instance.get();
      const { weather, main } = resp.data;

      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp,
      };
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = Busquedas;
