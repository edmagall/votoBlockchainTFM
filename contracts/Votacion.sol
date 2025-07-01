// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/* 
Representa una votación individual, donde se definen el administrador, candidatos y las reglas 
de votación. Gestiona la emisión de votos únicos y anónimos, el conteo de votos, el cierre o 
apertura de la votación, y proporciona funciones para consultar los resultados y al candidato 
ganador, asegurando la integridad y transparencia del proceso electoral.
*/
contract Votacion {
    
    address public administrador;           // Dirección del administrador (autoridad de la votación)
    string public nombreVotacion;           // Nombre descriptivo de la votación
    string public descripcionVotacion;      // Descripción adicional de la votación
    bool public activa;                     // Estado de la votación (activa o cerrada)
    uint public fechaInicio;                // Timestamp de inicio de la votación
    uint public fechaFin;                   // Timestamp de finalización de la votación

    //Eventos
    event VotoEmitido(uint indexed candidatoId);
    event CandidatoAgregado(uint indexed id, string nombre);


    /// @notice Constructor que inicializa la votación
    /// @param _admin Dirección que será administrador (creador)
    /// @param _nombre Nombre de la votación
    /// @param _descripcion Descripción de la votación
    /// @param _fechaInicio Fecha de inicio de la votación
    /// @param _fechaFin Fecha de fin de la votación
    constructor(
        address _admin,
        string memory _nombre,
        string memory _descripcion,
        uint _fechaInicio,
        uint _fechaFin
    ) {
        administrador = _admin;
        nombreVotacion = _nombre;
        descripcionVotacion = _descripcion;
        fechaInicio = _fechaInicio;
        fechaFin = _fechaFin;
        activa = true;                      // Inicialmente la votación está activa
    }

    /// @notice Modifier para restringir funciones solo al administrador
    modifier soloAdministrador() {
        require(msg.sender == administrador, "Solo el administrador puede ejecutar esta accion.");
        _;
    }

    /// @notice Modifier para permitir acciones solo si la votación está activa
    modifier soloSiActiva() {
        require(activa, "La votacion no esta activa.");
        require(block.timestamp >= fechaInicio, "La votacion no ha comenzado.");  //Verifica que el tiempo actual sea igual o posterior a la fecha de inicio. Si no lo es, lanza un error con el mensaje "Aun no comienza".
        require(block.timestamp <= fechaFin, "La votacion ha finalizado.");
        _;
    }

    /// @notice Modifier que valida que se está dentro del periodo de votación
    modifier soloDurantePeriodo() {
        require(block.timestamp >= fechaInicio, "La votacion no ha comenzado.");
        require(block.timestamp <= fechaFin, "La votacion ha finalizado.");
        _;
    }

    /// @notice Modifier que valida que se pueda añadir un nuevo candidato a la votación. Para eso, que no haya empezado 
    modifier soloSiNoEmpezada() {
        require(block.timestamp < fechaInicio , "La votacion ya ha comenzado.");
        _;
    }

    // ---------------------------- Gestión de Whitelist de votantes (los votantes que pueden votar) ----------------------------

    mapping(address => bool) public whitelist;   // Lista blanca de direcciones permitidas


    /// @notice Agrega una dirección a la whitelist
    /// @param votante Dirección a autorizar
    function agregarVotante(address votante) public soloAdministrador soloSiNoEmpezada {
        whitelist[votante] = true;
    }

    /// @notice Agrega múltiples direcciones a la whitelist
    /// @param votantes Array de direcciones a autorizar
    function agregarVotantes(address[] memory votantes) public soloAdministrador soloSiNoEmpezada {
        for (uint i = 0; i < votantes.length; i++) {
            whitelist[votantes[i]] = true;
        }
    }

    /// @notice Verifica si una dirección está habilitada para votar
    function estaEnWhitelist(address addr) public view returns (bool) {
        return whitelist[addr];
    }

    // ---------------------------- Estructura de Candidato ----------------------------

    /// @notice Estructura para almacenar datos de cada candidato
    struct Candidato {
        string nombre;          // Nombre del candidato
        string descripcion;     // Descripción del candidato
        string imagenIPFS;      // Hash IPFS para imagen o documento asociado
        uint votos;             // Conteo acumulado de votos recibidos
        string email;           // Email del candidato (para referencias o validaciones externas)
    }


    mapping(uint => Candidato) public candidatos;     // Mapping que relaciona un ID numérico con un candidato
    uint public totalCandidatos;                      // Contador de candidatos añadidos


    /// @notice Función para agregar un candidato a la votación
    /// @dev Solo puede llamarla el administrador y si la votación está activa
    /// @param _nombre Nombre del candidato
    /// @param _descripcion Descripción del candidato
    /// @param _imagenIPFS Hash IPFS de imagen/documento del candidato
    /// @param _email Email del candidato
    function agregarCandidato(
        string memory _nombre,
        string memory _descripcion,
        string memory _imagenIPFS,
        string memory _email
    ) public soloAdministrador soloSiNoEmpezada {
        candidatos[totalCandidatos] = Candidato(_nombre, _descripcion, _imagenIPFS, 0, _email);
        emit CandidatoAgregado(totalCandidatos, _nombre);
        totalCandidatos++;
    }


    // ---------------------------- Gestión de votantes y votos ----------------------------

    /// @notice Mapping para controlar si un votante ya ha votado, identificado por hash
    mapping(bytes32 => bool) public haVotado;       /// Uso bytes32 para anonimizar y evitar identificar directamente al usuario
    uint public totalVotantes;                      // Contador total de votos emitidos

    /// @notice Función para emitir un voto a un candidato
    /// @param idCandidato ID numérico del candidato al que se vota
    function votar(uint idCandidato) public soloSiActiva soloDurantePeriodo  {
        require(whitelist[msg.sender], "Tu direccion no esta autorizada para votar.");    //Valida que la persona tenga derecho a votar en la votación
        
        // Calculamos el hash de la dirección del votante
        bytes32 hashVotante = keccak256(abi.encodePacked(msg.sender));

        require(!haVotado[hashVotante], "Este votante ya ha emitido su voto.");       // Previene doble voto
        require(idCandidato < totalCandidatos, "Candidato invalido.");       // Valida que candidato exista

        haVotado[hashVotante] = true;            // Marcamos que este votante ya ha votado
        candidatos[idCandidato].votos++;         // Incremento el voto al candidato elegido
        totalVotantes++;                         // Aumento el contador total de votos

        emit VotoEmitido(idCandidato);
    }


    // ---------------------------- Funciones para obtener datos ----------------------------

    /// @notice Devuelve la información completa de un candidato dado su ID
    /// @param id ID numérico del candidato
    /// @return nombre Nombre del candidato
    /// @return descripcion Descripción del candidato
    /// @return imagenIPFS Hash IPFS de imagen o documento del candidato
    /// @return votos Total de votos que ha recibido el candidato
    /// @return email Correo electrónico del candidato
    function obtenerCandidato(uint id) public view returns (
        string memory nombre,
        string memory descripcion,
        string memory imagenIPFS,
        uint votos,
        string memory email
    ) {
        require(id < totalCandidatos, "ID de candidato no valido");

        Candidato memory c = candidatos[id];
        
        uint votosVisibles = block.timestamp > fechaFin ? c.votos : 0;

        return (c.nombre, c.descripcion, c.imagenIPFS, votosVisibles, c.email);
    }

    /// @notice Devuelve el ID del candidato ganador (con más votos)
    /// @dev Solo el administrador puede llamarla y solo si la votación ha finalizado
    /// @return idGanador ID numérico del candidato ganador
    function obtenerGanador() public view soloAdministrador returns (uint idGanador) {
        require(block.timestamp >= fechaFin || !activa, "La votacion aun no ha finalizado.");
        require(totalCandidatos > 0, "No hay candidatos registrados.");

        uint maxVotos = candidatos[0].votos;
        uint id = 0;

        for (uint i = 1; i < totalCandidatos; i++) {
            if (candidatos[i].votos > maxVotos) {
                maxVotos = candidatos[i].votos;
                id = i;
            }
        }

        return id;
    }

    /// @notice Devuelve los datos del candidato ganador al público (sin restricciones de rol)
    /// @return nombre Nombre del ganador
    /// @return descripcion Descripción del ganador
    /// @return imagenIPFS Imagen o documento del ganador
    /// @return votos Número total de votos del ganador
    /// @return email Correo del ganador
    function obtenerGanadorPublico() public view returns (
        string memory nombre,
        string memory descripcion,
        string memory imagenIPFS,
        uint votos,
        string memory email
    ) {
        require(block.timestamp >= fechaFin || !activa, "La votacion aun no ha finalizado.");
        require(totalCandidatos > 0, "No hay candidatos registrados.");

        uint id = 0;
        uint maxVotos = candidatos[0].votos;

        for (uint i = 1; i < totalCandidatos; i++) {
            if (candidatos[i].votos > maxVotos) {
                maxVotos = candidatos[i].votos;
                id = i;
            }
        }

        Candidato memory ganador = candidatos[id];
        return (ganador.nombre, ganador.descripcion, ganador.imagenIPFS, ganador.votos, ganador.email);
    }

    // ---------------------------- Control de estado de la votación ----------------------------

    /// @notice Finaliza la votación en caso de que se haya cumplido su duración 
    /// @dev Sólo el administrador puede ejecutarla
    function finalizarVotacion() public soloAdministrador {
        require(activa, "La votacion ya esta finalizada.");

        if (block.timestamp < fechaInicio && totalVotantes == 0) {
            // Cancelación anticipada porque no ha empezado y no hay votos
            activa = false;
            return;
        }

        // Si ya ha terminado, puede finalizar
        require(block.timestamp >= fechaFin, "La votacion aun no ha finalizado.");
        activa = false;
    }
}