import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const transport = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
        pass:process.env.NODE_CODE_SENDING_EMAIL_PASSWORD,
    },
})
//my code for verification
transport.verify((error,success)=>{
    if(error){
        console.log('SMTP error', error);
    } else {
        console.log('SMTP connection successful')
    }
})
export default transport;