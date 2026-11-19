require('dotenv').config();
const db = require('./db');
const createApp = require('./app');

const PORT = process.env.PORT || 3000;
const app = createApp(db);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
