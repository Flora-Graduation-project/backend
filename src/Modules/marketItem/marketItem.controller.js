import { catchError } from "../../Utils/catchError.js";
import { NOT_FOUND, UNAUTHORIZED ,SUCCESS, CREATED} from "../../Utils/statusCodes.js";
import MarketItem from '../../../DB/Models/marketItem/marketItem.model.js';


// add plant for sale
export const addMarketItem = catchError( async (req, res, next) => {
  const marketItem = await MarketItem.create({
    ...req.body,
    seller: req.user.id,
  });

  res.status(CREATED).json({
    message: "Plant Added for sale successfully!",
    data: marketItem,
  });
});

// get all market plants
export const getAllMarketItems = catchError(async (req, res, next) => {
  // pagination
  const page = req.query.page || 1;
  const limit = 14;
  const skip = (page - 1) * limit;

  const items = await MarketItem.find({ 
      isDeleted: false, 
      quantity: { $gt: 0 } 
    })
    .select("name image price quantity") 
    .skip(skip)
    .limit(limit);
    
  res.status(SUCCESS).json({
    results: items.length,
    data: items,
  });
});

// get plant by id
export const getMarketItemById = catchError(async (req, res, next) => {
  const item = await MarketItem.findOne({
    _id: req.params.id,
    isDeleted: false,
  }).populate("seller", "name profilePic");

  if (!item) {
    const err = new Error("Plant not found");
    err.statusCode = NOT_FOUND;
    return next(err);
  }

  res.status(SUCCESS).json({
    data: item,
  });
});

// edit plant
export const updateMarketItem = catchError(async (req, res, next) => {
  const item = await MarketItem.findById(req.params.id);

  if (!item || item.isDeleted) {
    return next(new Error("Plant not found"));
  }

  if (item.seller.toString() !== req.user.id.toString()) {
    const err = new Error("You are not allowed to update this plant");
    err.statusCode = UNAUTHORIZED;
    return next(err);
  }

  Object.assign(item, req.body);
  await item.save();

  res.status(SUCCESS).json({
    message: "Plant updated successfully!",
    data: item,
  });
});

// delete plant
export const deleteMarketItem = catchError(async (req, res, next) => {
  const item = await MarketItem.findById(req.params.id);

  if (!item || item.isDeleted) {
    const err = new Error("Plant not found");
    err.statusCode = NOT_FOUND;
    return next(err);
  }

  if (item.seller.toString() !== req.user.id.toString()) {
    const err = new Error("You are not allowed to delete this plant");
    err.statusCode = UNAUTHORIZED;
    return next(err);
  }

  item.isDeleted = true;
  item.deletedAt = new Date();
  await item.save();

  return res.status(200).json({
    success: true,
    message: "Plant deleted successfully!",
  });
});

















// export const deleteMarketItem = catchError(async (req, res, next) => {
//   const item = await MarketItem.findById(req.params.id);

//   if (!item || item.isDeleted) {
//     const err = new Error("Plant not found or already deleted");
//     err.statusCode = NOT_FOUND;
//     return next(err);
//   }

//   if (item.seller.toString() !== req.user._id.toString()) {
//     const err = new Error("You are not allowed to delete this plant");
//     err.statusCode = UNAUTHORIZED;
//     return next(err);
//   }

//   item.isDeleted = true;
//   await item.save();

//   return res.status(SUCCESS).json({
//     success: true,
//     message: "Plant deleted successfully",
//   });
// });



