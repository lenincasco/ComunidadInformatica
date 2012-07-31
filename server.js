var http = require('http'),
	server = http.createServer();

server.listen(8080);
console.log('Servidor Escuchando en puerto 8080'); //Declaración normal de Servidor NodeJs

var io = require('socket.io').listen(server); //Declaramos io como instancia de socket.io escuchando al servidor que creamos
var ursConectados = 0; //Cantidad de usuarios conectados
var usuarios = []; //Para almacenar los usuarios que se registren
var users = [] //Almacenar paralelo al mensaje enviado
var mensajes = []; //Para almacenar los mensajes que se envien

io.sockets.on('connection', function(socket){ //Evento que se produce cuando se conecta un cliente al servidor
	console.log('Nueva Socket Conectada ' + socket.id);
	ursConectados++;	
	io.sockets.emit('actualizarCantidad', ursConectados); //Emitir a todos la cantidad de usuarios conectados

	// Con este for recorremos cada uno de los mensajes enviados
	// y los emitimos a la socket que se acaba de conectar
	for(var ind = 0; ind < mensajes.length; ind++){
		var msj = mensajes[ind];
		var usr = users[ind];
		socket.emit('msjCon', msj, usr); // emitir usuario y mensaje a la socket conectada
	};

	// Cuando se de el evento 'nombre' recibiremos el nombre del cliente
	// y lo almacenamos en 'usuarios' y tambien en la propiedad username de la socket
	socket.on('nombre',function(nombre){
		console.log('Nombre cnectado: ' + nombre);
		usuarios.push(socket.id);		
		socket.username=nombre;
	});

	// Evento que devuelve el nombre de la socket que pregunta.
	socket.on('getNombre', function(){
		nombre = socket.username;
		socket.emit('usuario',socket.username);
		console.log('nombre: ' + socket.username);
	});

	// Evento que recibe un mensaje y el usuario que lo envia
	// guardamos el mensaje y actualizamos el nombre del usuario
	// Emitimos a todas las sockets el mensaje y el usuario que lo envio
	socket.on('mensaje',function(mensaje,usuario){
		mensajes.push(mensaje);
		users.push(usuario);
		usuario = socket.username;
		io.sockets.emit('mensaje',mensaje, usuario);
	});

	socket.on('disconnect', function(){
		ursConectados--;
		io.sockets.emit('actualizarCantidad', ursConectados);
		console.log('Quedan ' + ursConectados);	
	});	
});

