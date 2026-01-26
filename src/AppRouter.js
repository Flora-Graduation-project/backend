import cors from "cors";
import helmet from "helmet";
import { corsOptions } from "./Utils/corsOptions.js";
import { globalErrorHandler } from "./Middlewares/globalErrorHandler.js";
import { notFound } from "./Middlewares/notFound.js";
import authRouter from "./Modules/Auth/auth.router.js"
import userRouter from "./Modules/Users/users.router.js"
import marketItemRouter from "./Modules/marketItem/marketItem.router.js";
import wishlistRouter from "./Modules/wishList/wishList.route.js"
import cartRouter from "./Modules/Cart/cart.router.js"
import orderRouter from "./Modules/Order/order.router.js";

export const startApp = (app, express) => {

  app.use(cors(corsOptions));
  app.use(helmet());

  // middleware to parse json
  app.use(express.json());

  // User
  app.use("/auth", authRouter);
  app.use("/users", userRouter);
  app.use("/cart", cartRouter);

  // Market Items
  app.use("/market", marketItemRouter);

  // wishList
  app.use("/wishlist",wishlistRouter)

  // Orders
  app.use("/orders", orderRouter);

  // errorhandeler route
  app.use(globalErrorHandler);

  // not found
  app.use(notFound);
};
