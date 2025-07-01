// Script para crear una nueva votación usando GestorVotaciones

const { ethers } = require("hardhat");

async function main() {
  const [admin] = await ethers.getSigners();

  const Gestor = await ethers.getContractFactory("GestorVotaciones");
  const gestor = Gestor.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

  const emailAdmin = "admin@ejemplo.com";
  const nombreVotacion = "TFM Eduardo Magallanes";
  const descripcion = "Eleccion prueba para el TFM";

  const now = Math.floor(Date.now() / 1000);
  const fechaInicio = now + 120;        // empieza en 2 minutos
  const fechaFin = fechaInicio + 300;  // dura 5 minutos

  const tx = await gestor.crearVotacion(emailAdmin, nombreVotacion, descripcion, fechaInicio, fechaFin);
  await tx.wait();

  console.log(`Votación "${nombreVotacion}" creada para ${emailAdmin}`);

  const votacionInfo = await gestor.obtenerVotacion(emailAdmin, nombreVotacion);
  console.log("Dirección de la votación creada:", votacionInfo[0]);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
