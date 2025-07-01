//Script para abrir, cerrar, finalizar votación y obtener ganador

const { ethers } = require("hardhat");

async function main() {
  const [admin] = await ethers.getSigners();

  const gestorAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Cambia por la dirección de tu GestorVotaciones desplegado
  const Gestor = await ethers.getContractFactory("GestorVotaciones");
  const gestor = Gestor.attach(gestorAddress);

  const emailAdmin = "admin@ejemplo.com";
  const nombreVotacion = "TFM Eduardo Magallanes";

  const votacionInfo = await gestor.obtenerVotacion(emailAdmin, nombreVotacion);
  const direccionVotacion = votacionInfo[0];

  const Votacion = await ethers.getContractFactory("Votacion");
  const votacion = Votacion.attach(direccionVotacion);

  // Abrir votación (si está cerrada y sin votos)
  try {
    let tx = await votacion.abrirVotacion();
    await tx.wait();
    console.log("Votación abierta");
  } catch (e) {
    console.log("No se pudo abrir votación:", e.message);
  }

  // Cerrar votación (solo si no hay votos)
  try {
    let tx = await votacion.cerrarVotacion();
    await tx.wait();
    console.log("Votación cerrada");
  } catch (e) {
    console.log("No se pudo cerrar votación:", e.message);
  }

  // Finalizar votación (solo después de fechaFin)
  try {
    let tx = await votacion.finalizarVotacion();
    await tx.wait();
    console.log("Votación finalizada");
  } catch (e) {
    console.log("No se pudo finalizar votación:", e.message);
  }

  // Obtener ganador (solo administrador y votación finalizada)
  try {
    const idGanador = await votacion.obtenerGanador();
    console.log("ID del candidato ganador:", idGanador);

    const ganador = await votacion.obtenerGanadorPublico();
    console.log("Ganador público:", ganador);
  } catch (e) {
    console.log("No se pudo obtener ganador:", e.message);
  }

  // Listar candidatos y votos visibles
  try {
    const totalCandidatos = await votacion.totalCandidatos();

    console.log("Lista de candidatos:");
    for (let i = 0; i < totalCandidatos; i++) {
      const candidato = await votacion.obtenerCandidato(i);
      console.log(`ID: ${i} - Nombre: ${candidato.nombre} - Votos visibles: ${candidato.votos}`);
    }
  } catch (e) {
    console.log("Error al listar candidatos:", e.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });