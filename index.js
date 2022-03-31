require("dotenv").config();

const {
  leerInput,
  inquirerMenu,
  pausa,
  listarLugares,
} = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async () => {
  const busquedas = new Busquedas();
  let opt;

  do {
    opt = await inquirerMenu();

    switch (opt) {
      case 1:
        // mostrar mensaje
        const searchString = await leerInput("Ingrese un lugar:");

        // buscar lugares
        const lugares = await busquedas.ciudad(searchString);

        // seleccionar lugar
        const selectedId = await listarLugares(lugares);
        if (selectedId === "0") continue;
        const selectedLugar = lugares.find((lugar) => lugar.id === selectedId);

        // guardar en DB
        busquedas.agregarHistorial(selectedLugar.nombre);

        // datos clima
        const clima = await busquedas.climaLugar(
          selectedLugar.lat,
          selectedLugar.lng
        );

        // mostrar resultados
        console.clear();
        console.log("\nInformación de la ciudad\n".green);
        console.log("Ciudad:", selectedLugar.nombre.green);
        console.log("Lat:", selectedLugar.lat);
        console.log("Long:", selectedLugar.lng);
        console.log("Temperatura:", clima.temp);
        console.log("Mínima:", clima.min);
        console.log("Máxima:", clima.max);
        console.log("Descripción:", clima.desc.green);
        break;

      case 2:
        busquedas.historialCapitalizado.forEach((lugar, index) => {
          const idx = `${index + 1}`.green;
          console.log(`${idx} - ${lugar}`);
        });
        break;
    }

    if (opt !== 0) await pausa();
  } while (opt !== 0);
};

main();
