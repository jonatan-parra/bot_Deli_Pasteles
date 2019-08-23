'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const access_token = "EAAJgFXUAQ7UBADL254uvimAnSNTV36htKdIx1P9ZAglTHF5ZBQu4cAVgzFuZCXWtCXhk8wCiHZC9JGIC7ohs9M1iHkjoBf6U5V32XLz90fmKtMjaVPxyXsjwa0Isr3ib7SVHS1iweFeNNd15SIQn6oZB1hqO3rpJlH3ilnfWiyfot5L96djp2"
const app = express();

// Configuración del puerto
// Puerto 5000 para puerto local
// (process.env.PORT || 5000) para heroku
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
  if (req.query['hub.verify_token'] === 'token_deli') {
    // Crear la conexión
    response.send(req.query['hub.challenge']);
  } else{
    response.send('Pug Pizza no tiene permisos.');
  }
});

// Recibe mensajes, interpretar y responder
app.post('/webhook/', function(req, res){
  const webhook_event = req.body.entry[0];
  if(webhook_event.messaging){
    webhook_event.messaging.forEach(event => {
    //  console.log(event);
      handleEvent(event.sender.id, event);
    })
  }
  res.sendStatus(200);
});

// Evento
function handleEvent(senderId, event){
  if(event.message){
    handleMessage(senderId, event.message);
  } else if (event.postback){
    handlePostBack(senderId, event.postback.payload)
  }
}

// Responer mensaje
function handleMessage(senderId, event){
  if(event.text){
    //defaultMessage(senderId);
    //messageImage(senderId);
    //contactSuppport(senderId);
    //receipt(senderId);
    //showLocations(senderId);
    getLocation(senderId);

    showLocations
  } else if(event.attachments){
    handleAttachments(senderId, event)
  }
}


//
function defaultMessage(senderId){
  const messageData = {
    "recipient":{
      "id": senderId
    },
    "message": {
      "text": "Hola soy un robot de messenger y te invito a etulizar el menú",
      "quick_replies":[
        {
          "content_type": "text",
          "title": "¿Quieres un pastel?",
          "payload": "PASTELES_PAYLOAD"
        },
        {
          "content_type": "text",
          "title": "Acerca de",
          "payload": "ABOUT_PAYLOAD"
        }
      ]
    }
  }
  senderActions(senderId);
  callSendApi(messageData);
}

function handlePostBack(senderId, payload){
  console.log(payload);
  switch (payload) {
    case "GET_STARTED_DELIPASTELES":
      console.log(payload);
    break;
    case "PASTELES_PAYLOAD":
      showPasteles(senderId);
    break;
    case "PASTEL_CAT_PAYLOAD":
      sizePastel(senderId);
      //showPasteles(senderId);
    break;
  }
}
/*
Para las acciones:

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

function handleAttachments(senderId, event){
//  console.log("Entró en handleAttachments");
  let attachment_type = event.attachments[0].type;
  switch (attachment_type) {
    case "image":
    //  console.log("Mi imagen");
      console.log(attachment_type);
      break;

    case"video":
       console.log(attachment_type);
       break;

   case"audio":
       console.log(attachment_type);
       break;

   case"file":
       console.log(attachment_type);
       break;
   default:
         console.log(attachment_type);
   break;

  }


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
              "title": "Pastel de gatos",
              "image_url": "http://pasteleriadc.com/wp-content/uploads/torta-gatitos-huellas.jpg",
              "subtitle": "Contiene el amor de un gato",
              "buttons": [
                {
                  "type": "postback",
                  "title": "Elegir este 1",
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
                  "title": "Elegir pastel 2",
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
              "image_url": "http://www.maplepasteles.com.mx/wp-content/uploads/2016/11/Pastel-Piloto-de-Avi%C3%B3n.jpg",
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


function messageImage(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "attachment": {
                "type": "image",
                "payload": {
                    "url": "https://media.giphy.com/media/1dOIvm5ynwYolB2Xlh/giphy.gif"
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

// Escuchar en el puerto asignado
app.listen(app.get('port'), function(){
  console.log('Nuestro servidor esta funcionando en el puerto ', app.get('port'));
})













//
