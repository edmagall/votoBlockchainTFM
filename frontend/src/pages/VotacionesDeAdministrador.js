import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import GestorABI from '../abis/GestorVotaciones.json';
import '../App.css';


const GESTOR_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';   // Dirección del contrato Gestor

export default function VotacionesDeAdministrador() {
  const [votaciones, setVotaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addressAdmin, setAddressAdmin] = useState(null);

  useEffect(() => {
    async function fetchVotaciones() {
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
            setAddressAdmin(address);  // guarda la dirección

            const contratoGestor = new ethers.Contract(GESTOR_CONTRACT_ADDRESS, GestorABI.abi, signer);

            // Llamamos al método que funciona (ajusta según el nombre correcto)
            const votacionesAdmin = await contratoGestor.obtenerVotacionesPorAdminDir(address);

            if (!votacionesAdmin || votacionesAdmin.length === 0) {
                setVotaciones([]);
            } else {
                setVotaciones(votacionesAdmin);
            }
        } catch (e) {
            setError('Error al cargar votaciones: ' + e.message);
            setVotaciones([]);
        } finally {
            setLoading(false);
        }
    }

    fetchVotaciones();
  }, []);

  return (
    <div className="container">
      <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "#2c7a7b", letterSpacing: "2px", fontWeight: "900" }}>Mis Votaciones como ADMINISTRADOR</h2>
      {error && <p className="error-message">{error}</p>}
      {loading && <p>Cargando...</p>}
      {!loading && votaciones.length === 0 && <p>No tienes votaciones.</p>}

      <div className="votaciones-list">
        {votaciones.map((votacion, index) => (
          <div
            key={index}
            className="votacion-card"
            onClick={() => window.location.href = `/administrar-votacion/${votacion.direccionContrato}`}
          >
            <h3>{votacion.nombre}</h3>
            <p>{votacion.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}