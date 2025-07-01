import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import votacionAbi from '../abis/Votacion.json';
import { useParams } from "react-router-dom";
import '../App.css';


export default function AdministrarVotacion() {
  const { direccionContrato } = useParams();
  const CONTRACT_ADDRESS = direccionContrato;

  const [direccionVotante, setDireccionVotante] = useState("");
  const [batchVotantes, setBatchVotantes] = useState("");
  const [nombreCandidato, setNombreCandidato] = useState("");
  const [descripcionCandidato, setDescripcionCandidato] = useState("");
  const [imagenIPFS, setImagenIPFS] = useState("");
  const [emailCandidato, setEmailCandidato] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [detallesVotacion, setDetallesVotacion] = useState(null);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [loadingAgregar, setLoadingAgregar] = useState(false);
  const [loadingVotante, setLoadingVotante] = useState(false);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [loadingFinalizar, setLoadingFinalizar] = useState(false);
  const [ganador, setGanador] = useState(null);
  const [loadingGanador, setLoadingGanador] = useState(false);


  const ABI = votacionAbi.abi;

  // Función para obtener signer y contrato
  async function getContract() {
    if (!window.ethereum) throw new Error("MetaMask no detectado");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  }

  // Cargar detalles de la votación
  useEffect(() => {
    async function cargarDetalles() {
      if (!direccionContrato) return;
      setLoadingDetalles(true);
      
      try {
        if (!window.ethereum) throw new Error("MetaMask no detectado");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contrato = new ethers.Contract(direccionContrato, ABI, provider);

        // Detalles que tiene el contrato
        const nombre = await contrato.nombreVotacion();
        const descripcion = await contrato.descripcionVotacion();
        const activa = await contrato.activa();
        const fechaInicio = await contrato.fechaInicio();
        const fechaFin = await contrato.fechaFin();

        setDetallesVotacion({
          nombre,
          descripcion,
          activa,
          fechaInicio: new Date(Number(fechaInicio) * 1000).toLocaleString(),
          fechaFin: new Date(Number(fechaFin) * 1000).toLocaleString(),
        });
      } catch (error) {
        console.error("Error al cargar detalles:", error);
        setMensaje("Error cargando detalles de la votación: " + error.message);
        setDetallesVotacion(null);
      } finally {
        setLoadingDetalles(false);
      }
    }

    cargarDetalles();
  }, [direccionContrato]);

  // Función para agregar candidato
  async function agregarCandidato() {
    setMensaje("");
    try {
      setLoadingAgregar(true);
      const contrato = await getContract();
      const tx = await contrato.agregarCandidato(
        nombreCandidato,
        descripcionCandidato,
        imagenIPFS,
        emailCandidato
      );
      await tx.wait();
      setMensaje("Candidato agregado correctamente");
      setNombreCandidato("");
      setDescripcionCandidato("");
      setImagenIPFS("");
      setEmailCandidato("");
    } catch (error) {
      setMensaje("Error agregando candidato: " + error.message);
    } finally {
      setLoadingAgregar(false);
    }
  }

  // Función para agregar votante
  async function agregarVotante() {
    if (!direccionVotante) {
      setMensaje("Introduce una dirección válida.");
      return;
    }

    setLoadingVotante(true);
    try {
      const contrato = await getContract();
      const tx = await contrato.agregarVotante(direccionVotante);
      await tx.wait();
      setMensaje(`Votante ${direccionVotante} agregado con éxito.`);
      setDireccionVotante(""); // limpia el input
    } catch (error) {
      setMensaje("Error al agregar votante: " + error.message);
    } finally {
      setLoadingVotante(false);
    }
  }

  // Función para agregar votantes
  async function agregarVotantesBatch() {
    if (!batchVotantes.trim()) {
      setMensaje("Introduce al menos una dirección.");
      return;
    }

    const direcciones = batchVotantes
      .split(",")
      .map(addr => addr.trim())
      .filter(addr => addr !== "");

    if (direcciones.length === 0) {
      setMensaje("No se encontraron direcciones válidas.");
      return;
    }

    setLoadingBatch(true);
    try {
      const contrato = await getContract();
      const tx = await contrato.agregarVotantes(direcciones);
      await tx.wait();
      setMensaje(`${direcciones.length} votantes agregados con éxito.`);
      setBatchVotantes("");
    } catch (error) {
      setMensaje("Error al agregar votantes: " + error.message);
    } finally {
      setLoadingBatch(false);
    }
  }

  // Función para finalizar votación
  async function finalizarVotacion() {
    setLoadingFinalizar(true);
    try {
      const contrato = await getContract();
      const tx = await contrato.finalizarVotacion();
      await tx.wait();
      setMensaje("La votación ha sido finalizada con éxito.");
      // Actualizar estado de la votación
      setDetallesVotacion({ ...detallesVotacion, activa: false });
    } catch (error) {
      setMensaje("Error al finalizar la votación: " + error.message);
    } finally {
      setLoadingFinalizar(false);
    }
  }

  // Función para obtener ganador
  async function obtenerGanador() {
    setLoadingGanador(true);
    try {
      const contrato = await getContract();
      const datos = await contrato.obtenerGanador();
      setGanador({
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        votos: Number(datos.votos),
        email: datos.email,
      });
      setMensaje("Ganador obtenido correctamente.");
    } catch (error) {
      setMensaje("Error al obtener ganador: " + error.message);
    } finally {
      setLoadingGanador(false);
    }
  }


  return (
    <div className="container">
      <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "#2c7a7b", letterSpacing: "2px", fontWeight: "900" }}>
        Administrador de Votación
      </h2>

      {/* Detalles de la votación */}
      {loadingDetalles ? (
        <p style={{ textAlign: "center" }}>Cargando detalles de la votación...</p>
      ) : detallesVotacion ? (
        <div className="detalles-votacion">
          <h3>{detallesVotacion.nombre}</h3>
          <p>{detallesVotacion.descripcion}</p>
          <p><strong>¿Activa?:</strong> {detallesVotacion.activa ? "Sí" : "No"}</p>
          <p><strong>Inicio:</strong> {detallesVotacion.fechaInicio}</p>
          <p><strong>Fin:</strong> {detallesVotacion.fechaFin}</p>
          <p><strong>Dirección contrato:</strong> {direccionContrato}</p>
        </div>
      ) : (
        <p style={{ textAlign: "center", color: "#e53e3e" }}>No se pudieron cargar los detalles de la votación.</p>
      )}

      {/* Mensaje de estado */}
      {mensaje && (
        <div className={`message ${mensaje.startsWith("Error") ? "error" : "success"}`}>
          {mensaje}
        </div>
      )}

      {/* Formulario agregar candidato */}
      <div className="card">
        <h3>Agregar Candidato</h3>
        <input type="text" placeholder="Nombre del candidato" value={nombreCandidato} onChange={(e) => setNombreCandidato(e.target.value)} />
        <textarea placeholder="Descripción del candidato" value={descripcionCandidato} onChange={(e) => setDescripcionCandidato(e.target.value)} />
        <input type="text" placeholder="URL imagen IPFS del candidato" value={imagenIPFS} onChange={(e) => setImagenIPFS(e.target.value)} />
        <input type="email" placeholder="Email del candidato" value={emailCandidato} onChange={(e) => setEmailCandidato(e.target.value)} />
        <button onClick={agregarCandidato} style={{ marginTop: '0.5rem' }} disabled={loadingAgregar}>
          {loadingAgregar ? "Agregando..." : "Agregar Candidato"}
        </button>
      </div>

      {/* Sección votantes dividida en dos columnas */}
      <div className="votantes-container">
        {/* Votante individual */}
        <div className="votantes-section">
          <h4>Agregar votante individual</h4>
          <input type="text" placeholder="Dirección del votante" value={direccionVotante} onChange={(e) => setDireccionVotante(e.target.value)} />
          <button onClick={agregarVotante} disabled={loadingVotante}>
            {loadingVotante ? "Agregando..." : "Agregar Votante"}
          </button>
        </div>

        {/* Votantes batch */}
        <div className="votantes-section">
          <h4>Agregar múltiples votantes (separados por comas)</h4>
          <textarea placeholder="0x123..., 0xabc..., 0x456..." value={batchVotantes} onChange={(e) => setBatchVotantes(e.target.value)} />
          <button onClick={agregarVotantesBatch} disabled={loadingBatch}>
            {loadingBatch ? "Agregando..." : "Agregar Votantes"}
          </button>
        </div>
      </div>

      {/* Botones finalizar y obtener ganador */}
      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", flexDirection: "column" }}>
        <button className="btn btn-finalizar" onClick={finalizarVotacion} disabled={loadingFinalizar || !detallesVotacion?.activa} >
          {loadingFinalizar ? "Finalizando..." : "Finalizar Votación"}
        </button>

        <button className="btn btn-ganador" onClick={obtenerGanador} disabled={loadingGanador || detallesVotacion?.activa}>
          {loadingGanador ? "Obteniendo ganador..." : "Obtener Ganador"}
        </button>

        {ganador && (
          <div className="ganador-card">
            <h4>Ganador</h4>
            <p><strong>Nombre:</strong> {ganador.nombre}</p>
            <p><strong>Descripción:</strong> {ganador.descripcion}</p>
            <p><strong>Votos:</strong> {ganador.votos}</p>
            <p><strong>Email:</strong> {ganador.email}</p>
          </div>
        )}
      </div>
    </div>
  );
}