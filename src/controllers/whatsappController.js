const axios = require('axios');

const agents = [
  { name: 'Agent 1', number: 'whatsapp:+5491100000000' },
  { name: 'Agent 2', number: 'whatsapp:+5491100000001' },
  { name: 'Agent 3', number: 'whatsapp:+5491100000002' }
];
let currentAgentIndex = 0;

const sendInteractiveMessage = (phoneNumber) => {
  const token = process.env.WHATSAPP_TOKEN;
  const url = process.env.WHATSAPP_API_URL;

  // Datos para enviar el mensaje interactivo con botones
  const data = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: '¿Necesitas otro Agente?'
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: 'request_new_contact',
              title: 'Solicitar nuevo Agente'
            }
          }
        ]
      }
    }
  };

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Enviar el mensaje interactivo
  axios.post(url, data, { headers })
    .then(response => console.log(`Interactive message sent with ID: ${response.data.messages[0].id}`))
    .catch(error => console.error(`Error sending interactive message: ${error}`));
};

exports.handleIncomingMessage = (req, res) => {
  const data = req.body;
  const messageType = data.entry[0].changes[0].value.messages[0].type;
  const from = data.entry[0].changes[0].value.messages[0].from;

  if (messageType === 'text') {
    const incomingMsg = data.entry[0].changes[0].value.messages[0].text.body;
    const currentAgent = agents[currentAgentIndex];

    // Crear y enviar mensaje usando la API de WhatsApp Business
    axios.post(process.env.WHATSAPP_API_URL, {
      messaging_product: 'whatsapp',
      to: currentAgent.number,
      type: 'text',
      text: { body: `Nuevo mensaje de ${from}: ${incomingMsg}` }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => console.log(`Message sent with ID: ${response.data.messages[0].id}`))
    .catch(error => console.error(`Error sending message: ${error}`));

    res.send(`Gracias por contactarte con nosotros. Estás siendo redirigido a ${currentAgent.name}.`);

    // Actualizamos el índice del agente para el próximo mensaje
    currentAgentIndex = (currentAgentIndex + 1) % agents.length;

    // Enviar mensaje interactivo con botón
    sendInteractiveMessage(from);
  } else if (messageType === 'interactive' && data.entry[0].changes[0].value.messages[0].interactive.button_reply.id === 'request_new_contact') {
    sendInteractiveMessage(from);
  }
  
  res.status(200).json({ status: 'success' });
};
