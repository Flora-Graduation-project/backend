import  { Router } from "express";
import { addToWishList ,getWishList , removeFromWishList} from "./wishList.controller.js";
import { isAuthenticated } from "../../Middlewares/isAuth.js";
import { AddOrRemoveFromWishList } from "./wishList.validation.js";
import { validate } from "../../Middlewares/validate.js";

const router = Router();

// add to wishlist 

router.post("/add",isAuthenticated,validate(AddOrRemoveFromWishList),addToWishList);

// get wishlist

router.get("/",isAuthenticated,getWishList);

// remove from wishlist

router.delete("/remove",isAuthenticated,validate(AddOrRemoveFromWishList),removeFromWishList);

export default router

