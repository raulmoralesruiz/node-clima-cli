const fs = require("fs");

const { default: axios } = require("axios");

class Busquedas {
  historial = [];
  dbPath = "./db/database.json";

  constructor() {
    this.leerDB();
  }

  get historialCapitalizado() {
    return this.historial.map((lugar) => {
      let palabras = lugar.split(" ");
      palabras = palabras.map((p) => p[0].toUpperCase() + p.substring(1));

      return palabras.join(" ");
    });
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
        lng: parseFloat(lugar.lon),
        lat: parseFloat(lugar.lat),
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

  agregarHistorial(lugar = "") {
    if (this.historial.includes(lugar.toLocaleLowerCase())) {
      return;
    }

    // limitar historial a 5 resultados
    this.historial = this.historial.splice(0, 4);

    this.historial.unshift(lugar.toLocaleLowerCase());

    // grabar en DB
    this.guardarDB();
  }

  guardarDB() {
    const payload = { historial: this.historial };
    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  leerDB() {
    if (!fs.existsSync(this.dbPath)) return;

    const info = fs.readFileSync(this.dbPath, { encoding: "utf-8" });
    const data = JSON.parse(info);

    this.historial = data.historial;
  }
}

module.exports = Busquedas;
