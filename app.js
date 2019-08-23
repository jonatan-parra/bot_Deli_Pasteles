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
    //contactSuppport(senderId);
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
    case "PASTELES_3D_PAYLOAD":
      showPasteles3D(senderId);
    break;
    case "PASTELES_2D_PAYLOAD":
      //showPasteles2D(senderId);
      sizePastel(senderId);
    break;
    case "CUPCAKES_PAYLOAD":
      //showPasteles2D(senderId);
      CUPCAKES_PAYLOAD(senderId);
    break;

    case "COMO_REALIZAR_PEDIDO_PAYLOAD":
      enviar_mensaje_texto(senderId, "Dinos la fecha en que necesitas el pastel (Recuerda que debe ser 4 días antes)");
    break;
    case "FORMA_DE_PAGO_PAYLOAD":
      enviar_mensaje_texto(senderId, "Debes abonar el 50% del valor de la compra para pasar tu pastel a produccón");
    break;
    case "PORCIONES_PAYLOAD":
      enviar_mensaje_texto(senderId, "Nuestro pastel mas pequeño es de 6 porciones");
    break;
    case "PASTEL_CAT_PAYLOAD":
      sizePastel(senderId);
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

function showPasteles3D(senderId){
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
              "title": "Pastel de Minions",
              "image_url": "https://http2.mlstatic.com/pastel-de-fondant-3d-minions-D_NQ_NP_555521-MLM20786995813_062016-F.jpg",
              "subtitle": "Contiene el amor de un gato",
              "buttons": [
                {
                  "type": "postback",
                  "title": "Elegir este pastel",
                  "payload": "PASTEL_CAT_PAYLOAD",
                }
              ]
            },
            {
              "title": "Pastel de avión",
              "subtitle": "Contiene el amor de un avion",
              "image_url": "http://www.maplepasteles.com.mx/wp-content/uploads/2016/11/Pastel-Piloto-de-Avi%C3%B3n.jpg",
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


function sizePastel(senderId){
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
              "title": "Individual",
              "image_url": "https://i0.pngocean.com/files/250/448/850/2018-toyota-yaris-ia-lexus-is-car-car.jpg",
              "subtitle": "Porción individual",
              "buttons": [
                {
                  "type": "postback",
                  "title": "Elegir individual",
                  "payload": "PERSONAL_SIZE_PAYLOAD",
                }
              ]
            },
            {
              "title": "Mediana",
              "image_url": "http://pasteleriadc.com/wp-content/uploads/torta-gatitos-huellas.jpg",
              "subtitle": "Porcion mediana",
              "buttons": [
                {
                  "type": "postback",
                  "title": "Elegir mediana",
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
              "title": "Individual",
              "image_url": "https://ichef.bbci.co.uk/food/ic/food_16x9_832/recipes/cupcakes_93722_16x9.jpg",
              "subtitle": "Porción individual",
              "buttons": [
                {
                  "type": "postback",
                  "title": "Elegir individual",
                  "payload": "PERSONAL_SIZE_PAYLOAD",
                }
              ]
            },
            {
              "title": "Mediana",
              "image_url": "https://thebusybaker.ca/wp-content/uploads/2019/02/birthday-cake-cupcakes-with-chocolate-frosting-fb-ig-3.jpg",
              "subtitle": "Porcion mediana",
              "buttons": [
                {
                  "type": "postback",
                  "title": "Elegir mediana",
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
                    "text": "Hola este es el canal de soporte, ¿quieres llamarnos?",
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
                            "title": "Sucursal Mexico",
                            "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
                            "subtitle": "Direccion bonita #555",
                            "buttons": [
                                {
                                    "title": "Ver en el mapa",
                                    "type": "web_url",
                                    "url": "https://goo.gl/maps/GCCpWmZep1t",
                                    "webview_height_ratio": "compact"
                                }
                            ]
                        },
                        {
                            "title": "Sucursal Colombia",
                            "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
                            "subtitle": "Direccion muy lejana #333",
                            "buttons": [
                                {
                                    "title": "Ver en el mapa",
                                    "type": "web_url",
                                    "url": "https://goo.gl/maps/GCCpWmZep1t",
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
