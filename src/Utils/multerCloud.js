import multer from "multer";

export const uploadCloud = () => {
  
  const storage = multer.memoryStorage();
  const multerUpload = multer({ storage });

  return multerUpload;
};
  
export const uploadImage = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
           
            cb(null, true);
        } else {
           
            cb(new Error('INVALID_FILE_TYPE'), false);
        }
    }
}).single('image');

