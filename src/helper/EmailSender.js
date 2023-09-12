import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config();

const SendEmail = async (email,subject,text) =>{
    try
    {
        const transport = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: Number(process.env.EMAIL_PORT),
            secure: Boolean(process.env.SECURE),
            auth:{
                user: process.env.USER,
                pass: process.env.PASS,
            }
        })

        await transport.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: text
        });
    }
    catch(err){
        console.log(err);
    }
}

export default SendEmail