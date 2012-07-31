util = {
    zeroPad: function (digits, n) {
        n = n.toString()
        while (n.length < digits)
            n = '0' + n
        return n
    },

    timeString: function (date) {
        if (date == null) {
            // si el tiempo es nulo usar el tiempo actual
            date = new Date();
        } else if ((date instanceof Date) === false) {
            // si es un timestamp, se imterpreta
            date = new Date(date);
        }

        var minutes = date.getMinutes()
        var hours = date.getHours()
        var txt = 'AM'

        if (hours > 12) {
            hour = hours - 12
            txt = 'PM'
        }

        return this.zeroPad(2, hour) + ":" + this.zeroPad(2, minutes) + ' ' + txt
    },

    isBlank: function(text) {
        var blank = /^\s*$/
        return (text.match(blank) !== null)
    },

    replaceEmoticon: function(mensaje) {
        return mensaje.replace(/(:\)|:\(|:p|:P|:D|:o|:O|;\)|8\)|B\||>:\(|:\/|:'\(|3:\)|o:\)|O:\)|:\*|<3|\^_\^|-_-|o.O|>.<|:v|:V|:3|\(y\)|\(Y\))/g, '<span title="$1" class="emoticon"></span>')
    }
}

// Almacenar nombre del usuario
var user
// Nos conectamos a nuestro servidor Nodejs
var socket = io.connect('http://localhost:8080')

// Cuando el documento este listo
$(function() {
    // Obtenemos el nom para el campo donde va el nombre (id="nom")
    var nombre = $('#nom')
    // Obtenemos el input mensaje que es el campo del mensaje (id="mensaje")
    var mensaje = $('#mensaje')
    // si ya se habia conectado y por alguna razon recargo la pagina volvemos a poner su usario
    // el cual esta almacenado localmente
    if (localStorage.userName) {
        nombre.val(localStorage.userName)
        user = localStorage.userName
        socket.emit('nombre', user)
        nombre.attr('disabled', true)
        mensaje.focus()
    }

    // Cuando pierda el foco el campo nombre
    nombre.on('focusout', function() {
        // Validar si se ha escrito algo
        if ($(this).val() !== '') {
            // se desabilita el campo para no cambiar el nombre de suario
            $(this).attr('disabled', true)
            // Si se escribio
            // almacenamos localmente el nombre del usuario
            user = nombre.val()
            // Hacemos un llamado al servidor con la funcion 'nombre' y le pasamos el nombre
            socket.emit('nombre', user)
        }
    })

    // Cuando obtenga el enfoque el campo mensaje
    mensaje.on('focus', function() {
        // Comprobamos si ya tenemos un nombre en el campo
        if(!nombre.val()) {
            nombre.focus()
        }
    })

    //Cuando se da enter la caja de mensaje
    $('#mensaje').on('keyup', function(e) {
        if(e.which == 13) {
            e.preventDefault()
            // Si el campo nombre no esta vacio
            if (nombre.val()) {
                // Enviamos el mensaje al servidor por la funcion 'mensaje'
                socket.emit('mensaje', mensaje.val(), user)
                mensaje.val('')
                // si en local no tenemos almacenado el nombre de usuario, se almacena
                if (!localStorage.userName) {
                    localStorage.userName = user
                }
            }
        }
    })

    //Cuando se de el evento mensaje
    socket.on('mensaje', function(usuario, mensaje, time) {
        if (mensaje === null) return

        $('#messages').prepend('\
            <li>\
                <div class="avatar">\
                    <a href="http://twitter.com/' + usuario + '" title="&#64;' + usuario + '" target="_blank"><img src="https://api.twitter.com/1/users/profile_image?screen_name=' + usuario + '&size=normal" alt="&#64;' + usuario + '" height="48" width="48"></a>\
                </div>\
                <div class="text">\
                    <!--<a href="http://twitter.com/' + usuario + '" title="&#64;' + usuario + '" target="_blank">&#64;' + usuario + '</a>-->\
                    <time>' + util.timeString(time) + '</time>\
                    <p>' + util.replaceEmoticon(mensaje) + '</p>\
                </div>\
            </li>')
    })

    //Este evento hace lo mismo que la funcion mensaje pero, se da cuando se conecta un usuario nuevo
    socket.on('msjCon', function(usuario, mensaje, time) {
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