import { useEffect, useState } from 'react';
import { ethers, Contract } from 'ethers';
import GestorVotaciones from '../abis/GestorVotaciones.json';
import { useNavigate } from 'react-router-dom';

const CONTRATO_DIRECCION = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function Home() {
  const navigate = useNavigate();
  const [cuenta, setCuenta] = useState('');
  const [esSuperAdmin, setEsSuperAdmin] = useState(false);

  useEffect(() => {
    async function verificarCuenta() {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const cuentaActual = await signer.getAddress();
        setCuenta(cuentaActual);

        const contrato = new Contract(CONTRATO_DIRECCION, GestorVotaciones.abi, signer);
        const superAdmin = await contrato.superAdministrador();

        if (cuentaActual.toLowerCase() === superAdmin.toLowerCase()) {
          setEsSuperAdmin(true);
        }
      }
    }

    verificarCuenta();
  }, [navigate]);

  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem', textAlign: 'center' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', color: '#2c7a7b', letterSpacing: '2px', fontWeight: '900' }}>
        Bienvenido, {cuenta || 'cargando...'}
      </h2>

      {esSuperAdmin && (
        <div className="card" onClick={() => navigate('/crear-votacion')} 
             style={{ fontSize: '1.5rem', padding: '2rem', marginBottom: '2rem', cursor: 'pointer', backgroundColor: '#f0f0f0', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🗳️ Crear nueva votación</h3>
          <p style={{ fontSize: '1.25rem' }}>Solo para el súper administrador. Inicia una nueva votación desde cero.</p>
        </div>
      )}

      <div className="card" onClick={() => navigate('/votaciones-de-administrador')} 
           style={{ fontSize: '1.5rem', padding: '2rem', marginBottom: '2rem', cursor: 'pointer', backgroundColor: '#f0f0f0', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🧑‍💼 Ver mis votaciones como administrador</h3>
        <p style={{ fontSize: '1.25rem' }}>Consulta y administra las votaciones en las que soy administrador.</p>
      </div>

      <div className="card" onClick={() => navigate('/votaciones-de-votante')} 
           style={{ fontSize: '1.5rem', padding: '2rem', marginBottom: '2rem', cursor: 'pointer', backgroundColor: '#f0f0f0', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🙋‍♂️ Ver mis votaciones como votante</h3>
        <p style={{ fontSize: '1.25rem' }}>Participa o ve los resultados de las votaciones disponibles como votante registrado.</p>
      </div>
    </div>
  );
}
