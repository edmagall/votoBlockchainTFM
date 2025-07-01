import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import GestorABI from '../abis/GestorVotaciones.json';
import VotacionABI from '../abis/Votacion.json'; // ABI del contrato Votacion
import '../App.css';

const GESTOR_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export default function VotacionesDeVotante() {
  const [votaciones, setVotaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addressVotante, setAddressVotante] = useState(null);

  useEffect(() => {
    async function fetchVotacionesPermitidas() {
      if (!window.ethereum) {
        setError('MetaMask no detectado');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAddressVotante(address);

        const contratoGestor = new ethers.Contract(GESTOR_CONTRACT_ADDRESS, GestorABI.abi, signer);

        const total = await contratoGestor.obtenerTotalVotaciones();
        const votacionesPermitidas = [];

        for (let i = 0; i < total; i++) {
          const votacionInfo = await contratoGestor.todasLasVotaciones(i); // Struct con nombre, descripcion, direccionContrato
          const contratoVotacion = new ethers.Contract(votacionInfo.direccionContrato, VotacionABI.abi, signer);
          const estaPermitido = await contratoVotacion.estaEnWhitelist(address);

          if (estaPermitido) {
            votacionesPermitidas.push({
              direccionContrato: votacionInfo.direccionContrato,
              nombre: votacionInfo.nombre,
              descripcion: votacionInfo.descripcion,
            });
          }
        }

        setVotaciones(votacionesPermitidas);
      } catch (e) {
        setError('Error al cargar votaciones: ' + e.message);
        setVotaciones([]);
      } finally {
        setLoading(false);
      }
    }

    fetchVotacionesPermitidas();
  }, []);

  return (
    <div className="container">
      <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "#2c7a7b", letterSpacing: "2px", fontWeight: "900" }}>
        Mis Votaciones como VOTANTE
      </h2>
      {error && <p className="error-message">{error}</p>}
      {loading && <p>Cargando...</p>}
      {!loading && votaciones.length === 0 && <p>No estás admitido en ninguna votación.</p>}

      <div className="votaciones-list">
        {votaciones.map((votacion, index) => (
          <div
            key={index}
            className="votacion-card"
            onClick={() => window.location.href = `/votar/${votacion.direccionContrato}`}
          >
            <h3>{votacion.nombre}</h3>
            <p>{votacion.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
