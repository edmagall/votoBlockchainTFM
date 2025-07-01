// Script para emitir votos en la votación "prueba tfm Eduardo Magallanes" y mostrar resultados

const hre = require("hardhat");


async function main() {
  const [admin, votante1, votante2, votante3] = await hre.ethers.getSigners();

  const gestorAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Dirección de GestorVotaciones
  const Gestor = await ethers.getContractFactory("GestorVotaciones");
  const gestor = Gestor.attach(gestorAddress);

  const emailAdmin = "admin@ejemplo.com";
  const nombreVotacion = "TFM Eduardo Magallanes";

  const votacionInfo = await gestor.obtenerVotacion(emailAdmin, nombreVotacion);
  const direccionVotacion = votacionInfo[0];

  if (!direccionVotacion) {
    throw new Error("No se pudo obtener la dirección del contrato de votación.");
  }

  const Votacion = await ethers.getContractFactory("Votacion");
  const votacion = Votacion.attach(direccionVotacion);

  const votarCon = async (signer, candidatoId) => {
    const hashVotante = ethers.keccak256(ethers.toUtf8Bytes(signer.address));
    const tx = await votacion.connect(signer).votar(candidatoId, hashVotante);
    await tx.wait();
    console.log(`✅ ${signer.address} votó por el candidato ${candidatoId}`);
  };

  // Emitir votos (puedes ajustar los ID de candidato si quieres que voten a distintos)
  await votarCon(votante1, 0);
  await votarCon(votante2, 1);
  await votarCon(votante3, 1);

  // Mostrar resultados de los candidatos
  const totalCandidatos = await votacion.totalCandidatos();
  console.log(`\n📋 Resultados parciales: (${totalCandidatos} candidatos)\n`);

  for (let i = 0; i < totalCandidatos; i++) {
    const candidato = await votacion.candidatos(i);
    console.log(`🧑 Candidato ${i}: ${candidato.nombre}`);
    console.log(`   📝 Descripción: ${candidato.descripcion}`);
    console.log(`   🗳️ Votos: ${candidato.numVotos}\n`);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("❌ Error al ejecutar el script:", error);
    process.exit(1);
  });
