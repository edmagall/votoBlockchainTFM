// Script para agregar candidatos a la votación "prueba tfm Eduardo Magallanes"

const { ethers } = require("hardhat");

async function main() {
  const [admin] = await ethers.getSigners();

  const gestorAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Cambia por la dirección de tu GestorVotaciones desplegado
  const Gestor = await ethers.getContractFactory("GestorVotaciones");
  const gestor = Gestor.attach(gestorAddress);

  const emailAdmin = "admin@ejemplo.com";
  const nombreVotacion = "TFM Eduardo Magallanes";

  // Obtener la dirección del contrato Votacion
  const votacionInfo = await gestor.obtenerVotacion(emailAdmin, nombreVotacion);
  const direccionVotacion = votacionInfo[0];

  const Votacion = await ethers.getContractFactory("Votacion");
  const votacion = Votacion.attach(direccionVotacion);

  // Agregar candidatos (puedes modificar los datos)
  const candidatos = [
    { nombre: "Candidato A", descripcion: "Descripción A", imagenIPFS: "QmHashA", email: "a@candidatos.com" },
    { nombre: "Candidato B", descripcion: "Descripción B", imagenIPFS: "QmHashB", email: "b@candidatos.com" }
  ];

  for (const c of candidatos) {
    const tx = await votacion.agregarCandidato(c.nombre, c.descripcion, c.imagenIPFS, c.email);
    await tx.wait();
    console.log(`Agregado candidato: ${c.nombre}`);
  }

  // Mostrar todos los candidatos agregados
  const total = await votacion.totalCandidatos();
  console.log(`\nCandidatos registrados: ${total}\n`);
  
  for (let i = 0; i < total; i++) {
    const [nombre, descripcion, imagen, votos, email] = await votacion.obtenerCandidato(i);
    console.log(`ID ${i} → ${nombre} (${email})`);
    console.log(`   Descripción: ${descripcion}`);
    console.log(`   Imagen IPFS: ${imagen}`);
    console.log(`   Votos: ${votos}`);
    console.log();
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });