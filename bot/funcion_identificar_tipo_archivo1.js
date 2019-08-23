// Identifica el tipo de archivo subido por el usuario

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
s
