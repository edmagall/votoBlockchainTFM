// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;


import './Votacion.sol';


/* 
Contrato encargado de crear y administrar múltiples votaciones. 
Permite que un administrador cree nuevas votaciones, almacena la dirección de cada contrato 
de votación asociado a un identificador (como el email del administrador) y facilita el acceso 
a cada votación para su gestión y consulta.
*/
contract GestorVotaciones {
    
    //Eventos
    event VotacionCreada(address indexed contrato, string indexed email, string nombre);

    //Atributos
    address public superAdministrador;  //Para guardar la dirección del superadministrador, que será quein despliega el contrato

    // Estructura para almacenar la información de cada votación creada
    struct DetalleVotacion {
        address direccionContrato;  // Dirección del contrato Votacion desplegado
        string nombre;              // Nombre de la votación
        string descripcion;         // Descripción de la votación
        bool existe;                // Indicador para saber si la votación existe
    }

    // Mapeo que asocia la dirección de una wallet con una lista de votaciones creadas, es decir, asocia las direcciones de los administradores con sus votaciones
    mapping(address => DetalleVotacion[]) public votacionesPorAdminDir;

    // Mapeo que asocia un email con una lista de votaciones creadas
    mapping(string => DetalleVotacion[]) private votacionesPorAdmin;

    // Rápido lookup por email + nombre para evitar duplicados y facilitar búsquedas
    mapping(string => mapping(string => DetalleVotacion)) private lookupVotaciones;

    // Lista pública de todas las votaciones creadas
    DetalleVotacion[] public todasLasVotaciones;


    constructor() {
        superAdministrador = msg.sender;  // La persona que despliega el contrato
    }

    modifier soloSuperAdministrador() {
        require(msg.sender == superAdministrador, "Solo el superadministrador puede ejecutar esto");
        _;
    }

    /// @notice Crea una nueva votación y guarda su información
    /// @param administrador Dirección Ethereum del administrador de la votación
    /// @param email Identificador del administrador
    /// @param nombre Nombre de la votación
    /// @param descripcion Descripción de la votación
    /// @param fechaInicio Fecha de inicio de la votación (timestamp)
    /// @param fechaFin Fecha de finalización de la votación (timestamp)
    function crearVotacion(
        address administrador,
        string memory email,
        string memory nombre,
        string memory descripcion,
        uint fechaInicio,
        uint fechaFin
    ) public soloSuperAdministrador {
        require(!lookupVotaciones[email][nombre].existe, "Ya existe una votacion con ese nombre para este administrador.");

        Votacion nuevaVotacion = new Votacion(administrador, nombre, descripcion, fechaInicio, fechaFin);

        DetalleVotacion memory nueva = DetalleVotacion({
            direccionContrato: address(nuevaVotacion),
            nombre: nombre,
            descripcion: descripcion,
            existe: true
        });

        votacionesPorAdminDir[administrador].push(nueva);
        votacionesPorAdmin[email].push(nueva);
        lookupVotaciones[email][nombre] = nueva;

        todasLasVotaciones.push(nueva);

        emit VotacionCreada(address(nuevaVotacion), email, nombre);
    }

    /// @notice Devuelve la votación específica según email y nombre
    function obtenerVotacion(string memory email, string memory nombre) public view returns (
        address direccion,
        string memory nombreVotacion,
        string memory descripcion
    ) {
        require(lookupVotaciones[email][nombre].existe, "No existe esa votacion.");
        DetalleVotacion memory v = lookupVotaciones[email][nombre];
        return (v.direccionContrato, v.nombre, v.descripcion);
    }

    /// @notice Devuelve true si existe una votación con ese email y nombre
    function existeVotacion(string memory email, string memory nombre) public view returns (bool) {
        return lookupVotaciones[email][nombre].existe;
    }

    /// @notice Devuelve todas las votaciones asociadas a un administrador
    /// @param email Email del administrador
    /// @return votaciones Array con las votaciones creadas por el email
    function obtenerVotacionesPorAdmin(string memory email) public view returns (DetalleVotacion[] memory votaciones) 
    {
        return votacionesPorAdmin[email];
    }
 
    /// @notice Devuelve todas las votaciones asociadas a un administrador
    /// @param admin Dirección Ethereum del administrador de la votación
    /// @return Array con las votaciones creadas por la dirección etherium
    function obtenerVotacionesPorAdminDir(address admin) public view returns (DetalleVotacion[] memory) {
       return votacionesPorAdminDir[admin];
    }

    /// @notice Devuelve el total de votaciones creadas (útil para frontend)
    function obtenerTotalVotaciones() public view returns (uint) {
        return todasLasVotaciones.length;
    }
}
