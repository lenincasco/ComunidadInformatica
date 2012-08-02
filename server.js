var http = require('http'),
    server = http.createServer()

server.listen(8080)
// Declaración normal de Servidor NodeJs
console.log('Servidor Escuchando en puerto 8080')

// Declaramos io como instancia de socket.io escuchando al servidor que creamos
var io = require('socket.io').listen(server)
// Cantidad de usuarios conectados
var ursConectados = 0
// Para almacenar los usuarios que se registren
var usuarios = []
// Para almacenar los mensajes que se envien
var mensajes = []

// Evento que se produce cuando se conecta un cliente al servidor
io.sockets.on('connection', function(socket) {

    console.log('Nueva Socket Conectada ' + socket.id)
    ursConectados++
    // Emitir a todos la cantidad de usuarios conectados
    io.sockets.emit('actualizarCantidad', ursConectados)

    // Con este for recorremos cada uno de los mensajes enviados
    // y los emitimos a la socket que se acaba de conectar
    for(var ind = 0; ind < mensajes.length; ind++) {
        var usr = mensajes[ind].usuario
        var msj = mensajes[ind].mensaje
        var time = mensajes[ind].timestamp
        // emitir usuario y mensaje a la socket conectada

        socket.emit('msjCon', msj, usr, time)
    }

    // Cuando se de el evento 'nombre' recibiremos el nombre del cliente
    // y lo almacenamos en 'usuarios' y tambien en la propiedad username de la socket
    socket.on('nombre', function(nombre) {
        for (var i = 0; i < usuarios.length; i++) {
            if (usuarios[i] === nombre) {
                delete usuarios[i]
            }
        }
        usuarios = usuarios.filter(Boolean)
        usuarios.push(nombre)
        socket.username = nombre
    })

    // Evento que devuelve el nombre de la socket que pregunta.
    socket.on('getNombre', function() {
        nombre = socket.username
        socket.emit('usuario', socket.username)
        console.log('nombre: ' + socket.username)
    })

    // Evento que recibe un mensaje y el usuario que lo envia
    // guardamos el mensaje y actualizamos el nombre del usuario
    // Emitimos a todas las sockets el mensaje y el usuario que lo envio
    socket.on('mensaje', function(mensaje, usuario) {
        m = {
            usuario: usuario,
            mensaje: mensaje,
            timestamp: (new Date()).getTime()
        }
        mensajes.push(m)
        usuario = socket.username
        time = m.timestamp
        io.sockets.emit('mensaje', mensaje, usuario, time)
    })

    socket.on('disconnect', function() {
        ursConectados--
        io.sockets.emit('actualizarCantidad', ursConectados)
        console.log('Quedan Conectados' + ursConectados)
    })
})