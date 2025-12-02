import multer from "multer";

export const uploadCloud = () => {
  
  const storage = multer.memoryStorage();
  const multerUpload = multer({ storage });

  return multerUpload;
};
  


