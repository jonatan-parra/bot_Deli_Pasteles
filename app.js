'use strict'

/*
* Librerías
*/
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

/*
* Constantes
*/

// Token de facebook
const access_token = "EAAJgFXUAQ7UBADL254uvimAnSNTV36htKdIx1P9ZAglTHF5ZBQu4cAVgzFuZCXWtCXhk8wCiHZC9JGIC7ohs9M1iHkjoBf6U5V32XLz90fmKtMjaVPxyXsjwa0Isr3ib7SVHS1iweFeNNd15SIQn6oZB1hqO3rpJlH3ilnfWiyfot5L96djp2"

// Token secreto para recibir solo peticiones desde mi app
const token_secreto = "token_deli";

// Instanciar express
const app = express();

/*
* Configuración inicial
*/

// Configuración del puerto
app.set('port', (process.env.PORT || 5000) );

// Entender los elementos JSON que recibe del API
app.use(bodyParser.json());

// Ruta principal del servidor
app.get('/', function(req, response){
  response.send('Hola Mundo de Bots!!')
})

// Webhook, verificar con un token la conexión con FB
app.get('/webhook', function(req, response){
  // El token debe ser secreto
  if (req.query['hub.verify_token'] === token_secreto) {
    // Crear la conexión
    response.send(req.query['hub.challenge']);
  } else{
    response.send('No tiene permisos de entrar al bot.');
  }
});


/*
Acciones general de Facebook

mark_seen: Marca el último mensaje como leído.
typing_on: Activa los indicadores de escritura.
typing_off: Desactiva los indicadores de escritura.
*/
function senderActions(senderId){
  const messageData = {
    "recipient":{
      "id": senderId
    },
    "sender_action": "typing_on"
  }
  callSendApi(messageData);
}


/*
* Funciones del bot
*/

// Recibir mensajes, interpretar y responder
app.post('/webhook/', function(req, res){
  const webhook_event = req.body.entry[0];
  if(webhook_event.messaging){
    webhook_event.messaging.forEach(event => {
      //console.log(event);
      handleEvent(event.sender.id, event);
    })
  }
  res.sendStatus(200);
});

// Manejador de eventos
// Selecciona entre:
//                 Un postback dentro de un mensaje (Los que son devueltas de un quick_reply)
//                 Texto escrito por el usuario (Message)
//                 Un postback dentro de un evento
function handleEvent(senderId, event){
  if(event.message){
    if (event.message.quick_reply) {
      handlePostBack(senderId, event.message.quick_reply.payload);
    } else {
      handleMessage(senderId, event.message);
    }
  } else if (event.postback){
    handlePostBack(senderId, event.postback.payload)
  }
}

// Actuar al recibir un mensaje de texto escrito por el usuario
function handleMessage(senderId, event){
  if(event.text){
    defaultMessage(senderId);
    //messageImage(senderId);
    //contactSuppport(senderId);  **
    //receipt(senderId);
    //showLocations(senderId);
  } else if(event.attachments){
    handleAttachments(senderId, event)
  }
}


//
function defaultMessage(senderId){
  console.log("Entró en defaultMessage");
  const messageData = {
    "recipient":{
      "id": senderId
    },
    "message": {
      "text": "Hola soy un robot de messenger y te invito a utilizar el menú",
      "quick_replies":[
        {
          "content_type": "text",
          "title": "Ver el menú",
          "payload": "PASTELES_PAYLOAD"
        },
        {
          "content_type": "text",
          "title": "Tiempo de entrega",
          "payload": "TIEMPO_ENTREGA_PAYLOAD"
        }
      ]
    }
  }
  senderActions(senderId);
  callSendApi(messageData);
}

function handlePostBack(senderId, payload){
  console.log("payloda", payload);
  switch (payload) {
    case "GET_STARTED_DELIPASTELES":
      //console.log(payload);
      enviar_mensaje_texto(senderId, "Bienvenido a Delicias Angelus. Navega a través de nuestro menú");
    break;

    // Menú de productos
    case "PASTELES_PAYLOAD":
      showPasteles(senderId);
    break;
    case "CUPCAKES_PAYLOAD":
      //showPasteles2D(senderId);
      CUPCAKES_PAYLOAD(senderId);
    break;

    // Información de compra
    case "COMO_REALIZAR_PEDIDO_PAYLOAD":
      enviar_mensaje_texto(senderId, "Dinos la fecha en que necesitas el pastel (Recuerda que debe ser 8 días antes)");
    break;
    case "FORMA_DE_PAGO_PAYLOAD":
      enviar_mensaje_texto(senderId, "Debes abonar el 50% del valor de la compra para pasar tu pastel a producción");
    break;
    case "PROMOCION_PAYLOAD":
      messageImage(senderId);
      enviar_mensaje_texto(senderId, "Tenemos galletas con el 20% de descuento");
    break;

    // Información de contacto
    case "LLAMANOS_PAYLOAD":
      contactSuppport(senderId);
    break;
    case "UBICACION_PAYLOAD":
      showLocations(senderId);
    break;

  }
}


/*
* Respuestas generales en mensaje de texto
*/
function enviar_mensaje_texto(senderId, mensaje){
  const messageData = {
    "recipient":{
      "id": senderId
    },
    "message": {
      "text": mensaje
    }
  }
  senderActions(senderId);
  callSendApi(messageData);
}

function callSendApi(response){
  request({
    "uri": "https://graph.facebook.com/v2.11/me/messages",
    "qs": {
      "access_token": access_token
    },
    "method": "POST",
    "json": response
  },
  function(err){
    if(err){
      console.log("Ha ocurrido un error");
      console.log(err);
    } else {
      console.log("Mensaje enviado");
    }
  }
  )
}

function showPasteles(senderId){
  const messageData = {
    "recipient":{
      "id": senderId
    },
    "message": {
      "attachment":{
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [
            {
              "title": "Pastel de tenis",
              "image_url": "https://i.pinimg.com/736x/e0/b4/5c/e0b45ccc9a7d02f4c31644cf1d05e5a3.jpg",
              "subtitle": "8 porciones",
              "buttons": [
                {
                  "type": "postback",
                  "title": "Elegir este pastel",
                  "payload": "PASTEL_CAT_PAYLOAD",
                }
              ]
            },
            {
              "title": "Pastel de gato",
              "subtitle": "6 porciones",
              "image_url": "http://pasteleriadc.com/wp-content/uploads/torta-gatitos-huellas.jpg",
              "buttons": [
                {
                  "type": "postback",
                  "title": "Elegir este pastel",
                  "payload": "PASTEL_PLANE_PAYLOAD",
                }
              ]
            },
            {
              "title": "Pastel de cancha",
              "subtitle": "10 porciones",
              "image_url": "https://images-na.ssl-images-amazon.com/images/I/61R7a4EQgIL._SX466_.jpg",
              "buttons": [
                {
                  "type": "postback",
                  "title": "Elegir este pastel",
                  "payload": "PASTEL_PLANE_PAYLOAD",
                }
              ]
            }
          ]
        }
      }
    }
  }

  callSendApi(messageData);
}

function CUPCAKES_PAYLOAD(senderId){
  console.log("Entró en sizePastel");
  const messageData = {
    "recipient": {
      "id": senderId
    },
    "message": {
      "attachment": {
        "type":"template",
        "payload": {
          "template_type": "generic",
          "elements": [
            {
              "title": "Caja de cupcakes",
              "image_url": "https://ichef.bbci.co.uk/food/ic/food_16x9_832/recipes/cupcakes_93722_16x9.jpg",
              "subtitle": "Caja de 12 unidades",
              "buttons": [
                {
                  "type": "postback",
                  "title": "Elegir este",
                  "payload": "PERSONAL_SIZE_PAYLOAD",
                }
              ]
            },
            {
              "title": "Cupcake individual",
              "image_url": "https://thebusybaker.ca/wp-content/uploads/2019/02/birthday-cake-cupcakes-with-chocolate-frosting-fb-ig-3.jpg",
              "subtitle": "Cupcakes por unidad",
              "buttons": [
                {
                  "type": "postback",
                  "title": "Elegir este",
                  "payload": "MEDIANA_SIZE_PAYLOAD"
                }
              ]
            }
          ]
        }
      }
    }
  }
  callSendApi(messageData);
}

function contactSuppport(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "text": "Este es nuestro canal de soporte, ¿quieres llamarnos?",
                    "buttons": [
                        {
                            "type": "phone_number",
                            "title": "Llamar a un asesor",
                            "payload": "+571231231231"
                        }
                    ]
                }
            }
        }
    }
    callSendApi(messageData);
}

function messageImage(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "attachment": {
                "type": "image",
                "payload": {
                    "url": "https://cdn.pixabay.com/photo/2017/11/24/20/01/christmas-cookies-2975570_1280.jpg"
                }
            }
        }
    }
    callSendApi(messageData);
}

/*
"webview_height_ratio": "compact"
"webview_height_ratio": "tall"
"webview_height_ratio": "full"
*/
function showLocations(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [
                        {
                            "title": "Sucursal Parque Simón Bolivar",
                            "image_url": "http://www.redmas.com.co/wp-content/uploads/2017/08/20170821-Simon-Bol%C3%ADvar.jpg",
                            "subtitle": "Direccion bonita #555",
                            "buttons": [
                                {
                                    "title": "Ver en el mapa",
                                    "type": "web_url",
                                    "url": "https://www.google.com/maps/@4.6575995,-74.0946401,17.5z",
                                    "webview_height_ratio": "compact"
                                }
                            ]
                        },
                        {
                            "title": "Sucursal Jardín Botánico",
                            "image_url": "https://bogota.gov.co/sites/default/files/u38/Jard%C3%ADn%20Botanico-2.jpg",
                            "subtitle": "Direccion muy lejana #333",
                            "buttons": [
                                {
                                    "title": "Ver en el mapa",
                                    "type": "web_url",
                                    "url": "https://www.google.com/maps/@4.6686297,-74.0976013,18z",
                                    "webview_height_ratio": "tall"
                                }
                            ]
                        }
                    ]
                }
            }
        }
    }
    callSendApi(messageData);
}


function receipt(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "receipt",
                    "recipient_name": "Oscar Barajas",
                    "order_number": "123123",
                    "currency": "MXN",
                    "payment_method": "Efectivo",
                    "order_url": "https://platzi.com/order/123",
                    "timestamp": "123123123",
                    "address": {
                        "street_1": "Platzi HQ",
                        "street_2": "---",
                        "city": "Mexico",
                        "postal_code": "543135",
                        "state": "Mexico",
                        "country": "Mexico"
                    },
                    "summary": {
                        "subtotal": 12.00,
                        "shipping_cost": 2.00,
                        "total_tax": 1.00,
                        "total_cost": 15.00
                    },
                    "adjustments": [
                        {
                            "name": "Descuento frecuent",
                            "amount": 1.00
                        }
                    ],
                    "elements": [
                        {
                            "title": "Pizza Pepperoni",
                            "subtitle": "La mejor pizza de pepperoni",
                            "quantity": 1,
                            "price": 10,
                            "currency": "MXN",
                            "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg"
                        },
                        {
                            "title": "Bebida",
                            "subtitle": "Jugo de Tamarindo",
                            "quantity": 1,
                            "price": 2,
                            "currency": "MXN",
                            "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg"
                        }
                    ]
                }
            }
        }
    }
    callSendApi(messageData);
}


/*
Método deprecado
function getLocation(senderId){
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "text": "Ahora ¿Puedes proporcionarnos tu ubicación?",
            "quick_replies": [
                {
                    "content_type": "location"
                }
            ]
        }
    }
    callSendApi(messageData);
}
*/

// Escuchar en el puerto asignado
app.listen(app.get('port'), function(){
  console.log('Nuestro servidor esta funcionando en el puerto ', app.get('port'));
})













//
