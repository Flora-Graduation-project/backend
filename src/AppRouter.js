import cors from "cors";
import helmet from "helmet";
import { corsOptions } from "./Utils/corsOptions.js";
import { globalErrorHandler } from "./Middlewares/globalErrorHandler.js";
import { notFound } from "./Middlewares/notFound.js";

export const startApp = (app, express) => {

  app.use(cors(corsOptions));
  app.use(helmet());

  // middleware to parse json
  app.use(express.json());

  // errorhandeler route
  app.use(globalErrorHandler);

  // not found
  app.use(notFound);
};
