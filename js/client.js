// funciones utiles
util = {
    // mensajes sin leer
    unread: 0,
    focus: true,
    // agregar ceros al inicio
    zeroPad: function (digits, n) {
        n = n.toString()
        while (n.length < digits)
            n = '0' + n
        return n
    },

    salir: function() {
        var nombre = $('#nom')
        var logout = $('#salir')
        if (localStorage.userName) {
            localStorage.removeItem('userName')
            nombre.val('')          
            nombre.attr('disabled', false)
            nombre.focus()
            logout.hide()
        }
    },

    timeString: function (date) {
        if (date == null) {
            // si el tiempo es nulo, usar el tiempo actual
            date = new Date();
        } else if ((date instanceof Date) === false) {
            // si es un timestamp, se imterpreta
            date = new Date(date);
        }

        var minutes = date.getMinutes().toString()
        var hours = date.getHours().toString()
        var txt = 'AM'

        if (hours > 12) {
            hours = hours - 12
            txt = 'PM'
        }

        return this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes) + ' ' + txt
    },

    isBlank: function(text) {
        var blank = /^\s*$/
        return (text.match(blank) !== null)
    },

    replaceEmoticon: function(mensaje) {
        return mensaje.replace(/(:\)|:\(|:p|:P|:D|:o|:O|;\)|8\)|B\||>:\(|:\/|:'\(|3:\)|o:\)|O:\)|:\*|<3|\^_\^|-_-|o.O|>.<|:v|:V|:3|\(y\)|\(Y\))/g, '<span title="$1" class="emoticon"></span>')
    },

    updateTitle: function() {
        if (this.unread) {
            document.title = '(' + this.unread.toString() + ') chat'
        } else {
            document.title = 'Chat'
        }
    }
}

// Cuando el documento este listo
$(function() {
    // Nos conectamos a nuestro servidor Nodejs
    var socket = io.connect('http://localhost:8080')
    // Almacenar nombre del usuario
    var user
    // Obtenemos el nom para el campo donde va el nombre (id="nom")
    var nombre = $('#nom')
    // Obtenemos el input mensaje que es el campo del mensaje (id="mensaje")
    var mensaje = $('#mensaje')
    var logout = $('#salir')

    $('#salir').on('click', function() {
        util.salir()
    })

    // detectar el blur y el focus en el window
    $(window).on('blur', function() {
        util.focus = false
        util.updateTitle()
    })
    $(window).on('focus', function() {
        util.focus = true
        util.unread = 0
        util.updateTitle()
    })
    // si ya se habia conectado y por alguna razon recargo la pagina volvemos a poner su usario
    // el cual esta almacenado localmente
    // Comprobamos si no es null, para que no nos ponga un objeto nulo en el campo nombre
    if (localStorage.userName) {
        nombre.val(localStorage.userName)
        user = localStorage.userName
        socket.emit('nombre', user)
        nombre.attr('disabled', true)
        mensaje.focus()
        logout.show()
    }

    // Cuando pierda el foco el campo nombre
    nombre.on('focusout', function() {
        // Validar si se ha escrito algo
        if ($(this).val()) {
            // se desabilita el campo para no cambiar el nombre de suario
            $(this).attr('disabled', true)
            // Si se escribio
            // almacenamos localmente el nombre del usuario
            user = nombre.val()
            // Hacemos un llamado al servidor con la funcion 'nombre' y le pasamos el nombre
            socket.emit('nombre', user)
            // Una vez logueado mostrar el boton de salir
            logout.show()
            // si en local no tenemos almacenado el nombre de usuario, se almacena
            if (!localStorage.userName) {
                localStorage.userName = user
            }
        }
    })

    // Cuando obtenga el enfoque el campo mensaje
    mensaje.on('focus', function() {
        // Comprobamos si ya tenemos un nombre en el campo
        if(!nombre.val()) {
            nombre.focus()
        }
    })

    // Cuando se da enter la caja de mensaje
    $('#mensaje').on('keyup', function(e) {
        if(e.which === 13) {
            e.preventDefault()
            // Si el campo nombre no esta vacio
            if (nombre.val() && !util.isBlank(mensaje.val())) {
                // Enviamos el mensaje al servidor por la funcion 'mensaje'
                socket.emit('mensaje', mensaje.val(), user)
                mensaje.val('')
            }
        }
    })

    //Cuando se de el evento mensaje
    socket.on('mensaje', function(mensaje, usuario, time) {
        if(!util.focus) util.unread++
        util.updateTitle()

        var sonido = document.getElementById('pop')
        sonido.play()
        $('#messages').prepend('\
            <li>\
                <div class="avatar">\
                    <a href="http://twitter.com/' + usuario + '" title="&#64;' + usuario + '" target="_blank"><img src="https://api.twitter.com/1/users/profile_image?screen_name=' + usuario + '&size=normal" alt="&#64;' + usuario + '" height="48" width="48"></a>\
                </div>\
                <div class="text">\
                    <a href="http://twitter.com/' + usuario + '" title="&#64;' + usuario + '" target="_blank">&#64;' + usuario + '</a>\
                    <time>' + util.timeString(time) + '</time>\
                    <p>' + util.replaceEmoticon(mensaje) + '</p>\
                </div>\
            </li>')
    })

    //Este evento hace lo mismo que la funcion mensaje pero, se da cuando se conecta un usuario nuevo
    socket.on('msjCon', function(mensaje, usuario, time) {
        $('#messages').prepend('\
            <li>\             <div class="avatar">\
                    <a href="http://twitter.com/' + usuario + '" title="&#64;' + usuario + '" target="_blank"><img src="https://api.twitter.com/1/users/profile_image?screen_name=' + usuario + '&size=normal" alt="&#64;' + usuario + '" height="48" width="48"></a>\
                </div>\
                <div class="text">\
                    <a href="http://twitter.com/' + usuario + '" title="&#64;' + usuario + '" target="_blank">&#64;' + usuario + '</a>\
                    <time>' + util.timeString(time) + '</time>\
                    <p>' + util.replaceEmoticon(mensaje) + '</p>\
                </div>\
            </li>')
    })

    socket.on('actualizarCantidad', function(cantidad) {
        $('#cantU').text(cantidad)
    })
})