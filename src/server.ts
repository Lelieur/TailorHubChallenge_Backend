import app from './app';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const PORT: number = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.FLY_APP_NAME ? '0.0.0.0' : '127.0.0.1';

app.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});
