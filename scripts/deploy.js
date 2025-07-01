const { ethers } = require("hardhat");

async function main() {
  console.log("Iniciando despliegue...");

  const GestorVotaciones = await ethers.getContractFactory("GestorVotaciones");
  // Obtenemos la "fábrica" (Factory) del contrato 'GestorVotaciones'.
  // Esto significa que le decimos a ethers: "prepárame para desplegar este contrato".
  // Devuelve un objeto que permite crear instancias desplegadas del contrato.

  const gestor = await GestorVotaciones.deploy()
  // Desplegamos el contrato en la red configurada (Hardhat network en este caso).
  // Esto inicia el proceso de envío de la transacción para crear el contrato en la blockchain simulada.

  await gestor.waitForDeployment(); 
  // Esperamos a que la transacción de despliegue sea confirmada y que el contrato esté listo para usarse.

  console.log("Contrato GestorVotaciones desplegado en:", gestor.target);
}

main()
  .then(() => {
    console.log("Despliegue terminado correctamente.");
    process.exit(0);
  })
  .catch(error => {
    console.error("Error en el despliegue:", error);
    process.exit(1);
  });
