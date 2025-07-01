import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import metamaskLogo from '../assets/logoMetaMask.png';

export default function Login() {
  const navigate = useNavigate();
  const [conectando, setConectando] = useState(false);
  const [yaConectado, setYaConectado] = useState(false);

  useEffect(() => {
    // Verifica si MetaMask ya tiene alguna cuenta conectada
    const verificarConexion = async () => {
      if (window.ethereum) {
        const cuentas = await window.ethereum.request({ method: 'eth_accounts' });
        if (cuentas.length > 0) {
          localStorage.setItem('direccion', cuentas[0]);
          setYaConectado(true);
          navigate('/home');
        }
      }
    };
    verificarConexion();
  }, [navigate]);

  const conectarMetamask = async () => {
    if (window.ethereum) {
      setConectando(true);
      try {
        const cuentas = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (cuentas.length > 0) {
          localStorage.setItem('direccion', cuentas[0]);
          navigate('/home');
        }
      } catch (error) {
        if (error.code === -32002) {
          alert("Ya hay una solicitud de conexión pendiente. Revisa MetaMask.");
        } else {
          alert("Error al conectar con MetaMask.");
        }
      } finally {
        setConectando(false);
      }
    } else {
      alert("MetaMask no está instalada. Instálala desde https://metamask.io/");
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '5rem' }}>
      <img src={metamaskLogo} alt="MetaMask" style={{ width: '150px', marginBottom: '2rem' }} />
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Conectarse con MetaMask</h2>
      <button
        onClick={conectarMetamask}
        disabled={conectando || yaConectado}
        style={{
          fontSize: '1.5rem',
          padding: '2.5rem 0rem',
          cursor: conectando || yaConectado ? 'not-allowed' : 'pointer',
          opacity: conectando || yaConectado ? 0.6 : 1,
          width: '180px',
          borderRadius: '8px',
          backgroundColor: '#f6851b',
          color: 'white',
          border: 'none',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'background-color 0.3s ease',
          display: 'inline-block',
        }}
        onMouseEnter={e => !conectando && !yaConectado && (e.currentTarget.style.backgroundColor = '#e2761b')}
        onMouseLeave={e => !conectando && !yaConectado && (e.currentTarget.style.backgroundColor = '#f6851b')}
      >
        {conectando ? 'Conectando...' : 'Conectar'}
      </button>
    </div>
  );
}
