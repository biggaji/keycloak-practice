import express from 'express';
import session from 'express-session';
import Keycloak from 'keycloak-connect';
import { config } from 'dotenv';
import path from 'node:path';

config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setup session middleware
const memoryStore = new session.MemoryStore();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  }),
);

// Init Keycloak
const keycloak = new Keycloak(
  {
    store: memoryStore,
  },
  path.resolve(process.cwd(), 'keycloak.json'),
);

app.use(keycloak.middleware());

app.get('/', (req, res, next) => {
  res.status(200).json({
    message: 'Hello World API',
  });
});

app.get('/pro', keycloak.protect(), (req, res, next) => {
  res.status(200).json({
    message: 'This route is protected by keycloak',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
