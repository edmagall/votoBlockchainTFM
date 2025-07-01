import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import votacionAbi from "../abis/Votacion.json";
import '../App.css';

export default function VotacionDetalleVotante() {
  const { direccionContrato } = useParams();
  const ABI = votacionAbi.abi;

  const [candidatos, setCandidatos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [detallesVotacion, setDetallesVotacion] = useState(null);
  const [yaHaVotado, setYaHaVotado] = useState(false);
  const [votando, setVotando] = useState(false);

  // Obtener instancia del contrato conectado al signer
  async function getContractWithSigner() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(direccionContrato, ABI, signer);
  }

  // Obtener instancia de solo lectura
  async function getContractReadOnly() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    return new ethers.Contract(direccionContrato, ABI, provider);
  }

  // Cargar datos de la votación y del usuario
  useEffect(() => {
    async function cargarDatos() {
      try {
        if (!direccionContrato || !window.ethereum) return;

        await window.ethereum.request({ method: "eth_requestAccounts" });

        const contratoLectura = await getContractReadOnly();
        const nombre = await contratoLectura.nombreVotacion();
        const descripcion = await contratoLectura.descripcionVotacion();
        const activa = await contratoLectura.activa();
        const fechaInicio = await contratoLectura.fechaInicio();
        const fechaFin = await contratoLectura.fechaFin();

        setDetallesVotacion({
          nombre,
          descripcion,
          activa,
          fechaInicio: new Date(Number(fechaInicio) * 1000).toLocaleString(),
          fechaFin: new Date(Number(fechaFin) * 1000).toLocaleString()
        });

        // Cargar candidatos
        const total = await contratoLectura.totalCandidatos();
        const lista = [];
        for (let i = 0; i < total; i++) {
          const c = await contratoLectura.candidatos(i);
          lista.push({
            id: i,
            nombre: c.nombre,
            descripcion: c.descripcion,
            email: c.email,
            imagen: c.imagen,
            votos: Number(c.votos)
          });
        }
        setCandidatos(lista);

        // Comprobar si el usuario ha votado
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        const hashVotante = ethers.keccak256(ethers.toUtf8Bytes(userAddress));
        const yaVoto = await contratoLectura.haVotado(hashVotante);
        setYaHaVotado(yaVoto);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setMensaje("Error cargando datos: " + error.message);
      }
    }

    cargarDatos();
  }, [direccionContrato]);

  async function votarPorCandidato(id) {
    setMensaje("");
    setVotando(true);
    try {
      const contrato = await getContractWithSigner();
      const tx = await contrato.votar(id);
      await tx.wait();
      setMensaje("✅ Voto emitido correctamente.");
      setYaHaVotado(true);
    } catch (error) {
      console.error("Error al votar:", error);
      setMensaje("❌ Error al votar: " + error.message);
    } finally {
      setVotando(false);
    }
  }

  return (
    <div className="container">
      <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "#2c7a7b", letterSpacing: "2px", fontWeight: "900" }}>
        VOTANTE: Detalle de Votación
      </h2>

      {mensaje && (
        <div className={`message ${mensaje.startsWith("Error") ? "error" : "success"}`}>
          {mensaje}
        </div>
      )}

      {detallesVotacion && (
        <>
          <div className="detalles-votacion">
            <h3>{detallesVotacion.nombre}</h3>
            <p>{detallesVotacion.descripcion}</p>
            <p><strong>Inicio:</strong> {detallesVotacion.fechaInicio}</p>
            <p><strong>Fin:</strong> {detallesVotacion.fechaFin}</p>
            <p><strong>¿Activa?:</strong> {detallesVotacion.activa ? "Sí" : "No"}</p>
            <p><strong>Dirección del contrato:</strong> {direccionContrato}</p>
          </div>

          {detallesVotacion.activa ? (
            <>
              <h3 style={{ marginTop: "2rem" }}>Candidatos</h3>
              {candidatos.length === 0 ? (
                <p>No hay candidatos disponibles.</p>
              ) : (
                <div className="candidatos-grid">
                  {candidatos.map((candidato) => (
                    <div key={candidato.id} className="card candidato-card">
                      {candidato.imagen && (
                        <img
                          src={candidato.imagen}
                          alt={candidato.nombre}
                          style={{ width: "100%", height: "200px", objectFit: "cover" }}
                        />
                      )}
                      <h4>{candidato.nombre}</h4>
                      <p>{candidato.descripcion}</p>
                      <p><strong>Email:</strong> {candidato.email}</p>
                      {!yaHaVotado && (
                        <button
                          onClick={() => votarPorCandidato(candidato.id)}
                          disabled={votando}
                        >
                          {votando ? "Votando..." : "Votar"}
                        </button>
                      )}
                      {yaHaVotado && (
                        <p style={{ color: "#718096" }}><em>Ya has votado.</em></p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h3 style={{ marginTop: "2rem" }}>Resultados</h3>
              <div className="candidatos-grid">
                {candidatos.map((candidato) => (
                  <div key={candidato.id} className="card candidato-card">
                    {candidato.imagen && (
                      <img
                        src={candidato.imagen}
                        alt={candidato.nombre}
                        style={{ width: "100%", height: "200px", objectFit: "cover" }}
                      />
                    )}
                    <h4>{candidato.nombre}</h4>
                    <p>{candidato.descripcion}</p>
                    <p><strong>Votos recibidos:</strong> {candidato.votos}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
