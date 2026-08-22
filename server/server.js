import dotenv from 'dotenv';

dotenv.config();

const { createApp } = await import('./app.js');

const app = createApp();
const port = process.env.PORT || 4000;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`CyberEscape API running on port ${port}`);
});
