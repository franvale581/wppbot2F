require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const whatsappRoutes = require('./routes/whatsappRoutes');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/whatsapp', whatsappRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
