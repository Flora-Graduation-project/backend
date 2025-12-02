import cron from 'node-cron';
import {User} from '../../DB/Models/User/user.model.js';
import { catchError } from '../Utils/catchError.js';

export const deleteSoftDeletedUsers = catchError(async () => {
cron.schedule('0 0 * * *', async() => {
let today = new Date();
const users = await User.find({ isDeleted: true, deletedAt: { $lte: new Date(today.getTime() - 30*24*60*60*1000) } });
if(users.length > 0){
  for(const user of users){
    await User.findByIdAndDelete(user._id);
    console.log(`Permanently deleted user with ID: ${user._id}`);
  }
}
})});