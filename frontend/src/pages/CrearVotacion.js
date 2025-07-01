import '../App.css';
import React, { useState } from 'react';
import { ethers } from 'ethers';
import gestorABI from '../abis/GestorVotaciones.json';


const abi = gestorABI.abi || gestorABI.default?.abi;
const GESTOR_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';  // <-- aquí va la dirección real del contrato


export default function CrearVotacion() {
  const [form, setForm] = useState({
    administrador: '',
    email: '',
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
  });

  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Función para cambiar la red a Hardhat local en MetaMask
  async function switchToHardhatNetwork() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7a69' }], // 31337 en hexadecimal
      });
    } catch (error) {
      if (error.code === 4902) {
        // Si la red no está agregada, la agregamos
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x7a69',
              chainName: 'Hardhat Localhost',
              rpcUrls: ['http://127.0.0.1:8545'],
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
            }],
          });
        } catch (addError) {
          console.error('Error añadiendo la red Hardhat:', addError);
        }
      } else {
        console.error('Error cambiando la red:', error);
      }
    }
  }

  const crearVotacion = async () => {
    try {
      if (!window.ethereum) throw new Error('MetaMask no detectado');

      // Cambiamos a red Hardhat antes de solicitar cuentas y enviar tx
      await switchToHardhatNetwork();

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const gestor = new ethers.Contract(GESTOR_CONTRACT_ADDRESS, abi, signer);

      const fechaInicioTimestamp = Math.floor(new Date(form.fechaInicio).getTime() / 1000);
      const fechaFinTimestamp = Math.floor(new Date(form.fechaFin).getTime() / 1000);
      
      const tx = await gestor.crearVotacion(
        form.administrador,
        form.email,
        form.nombre,
        form.descripcion,
        fechaInicioTimestamp,
        fechaFinTimestamp
      );

      await tx.wait();
      setMensaje('✅ Votación creada con éxito');
    } catch (err) {
      console.error(err);
      setMensaje('❌ Error al crear la votación: ' + err.message);
    }
  };

  return (
    <div className="container">
        <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "#2c7a7b", letterSpacing: "2px", fontWeight: "900" }}>
            SUPER ADMNISTRADOR: Crear votación
        </h2>

        <div className="card">
            <h3>Rellene los campos para crear una votación</h3>
            <input name="administrador" placeholder="Dirección del administrador" value={form.administrador} onChange={handleChange} />
            <input name="email" placeholder="Email del administrador" value={form.email} onChange={handleChange} />
            <input name="nombre" placeholder="Nombre de la votación" value={form.nombre} onChange={handleChange} />
            <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} />
            <label>Fecha Inicio:</label>
            <input type="datetime-local" name="fechaInicio" value={form.fechaInicio} onChange={handleChange} />
            <label>Fecha Fin:</label>
            <input type="datetime-local" name="fechaFin" value={form.fechaFin} onChange={handleChange} />
            <button className="btn btn-lg" style={{ marginTop: '3rem' }} onClick={crearVotacion}>Crear</button>
            <p>{mensaje}</p>
        </div>
    </div>
  );
}
