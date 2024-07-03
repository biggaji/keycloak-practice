import express from 'express';
import session from 'express-session';
import Keycloak from 'keycloak-connect';
import { config } from 'dotenv';
import path from 'node:path';

// Loads environment variables
config();

const app = express();

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

// Mount keycloak middleware
app.use(keycloak.middleware());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Handles request to the index route
app.get('/', (req, res, next) => {
  res.status(200).json({
    message: 'Hello World API',
  });
});

/**
 * Handles request to the /pro route
 * This route is protected by Keycloak.
 * It requires the requesting client to provide an access token from Keycloak server which is then validated by this middleware keycloak.protect()
 */
app.get('/pro', keycloak.protect(), (req, res, next) => {
  res.status(200).json({
    message: 'This route is protected by keycloak',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
