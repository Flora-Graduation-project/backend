import  { Router } from "express";
import { addToWishList ,getWishList , removeFromWishList , moveToCartFromWishList} from "./wishList.controller.js";
import { isAuthenticated } from "../../Middlewares/isAuth.js";
import { AddOrRemoveFromWishList } from "./wishList.validation.js";
import { validate } from "../../Middlewares/validate.js";
import { addToCart } from "../Cart/cart.controller.js";

const router = Router();

// add to wishlist 

router.post("/add",isAuthenticated,validate(AddOrRemoveFromWishList),addToWishList);

// get wishlist

router.get("/",isAuthenticated,getWishList);

// remove from wishlist

router.delete("/remove",isAuthenticated,validate(AddOrRemoveFromWishList),removeFromWishList);

// move from wishlist to cart

router.post("/move-to-cart",isAuthenticated,validate(AddOrRemoveFromWishList),moveToCartFromWishList,addToCart);

export default router

