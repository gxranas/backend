import express from 'express'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { getUserByID, resetPassword, getTokenByUserID, getUserByEmail, createUser, deleteToken, getTokenByID, getTokenByUserIDAndToken, createToken , verifiedUser} from '../../database/Database.js';
import SendEmail from '../../helper/EmailSender.js';

dotenv.config();
const router = express.Router();

router.post('/signup',async (req,res)=>{
    try{
    const {email,password} = req.body
    let user = await getUserByEmail(email)
    if(user[0])
    {
        if(user[0].userEmail === email)
        {
            return res.json({ message: "This email is already taken."});
        }
    }
    const hashPassword = await bcrypt.hash(password, parseInt(process.env.SALT));
    user = await createUser(email, hashPassword, 0)
    const token = await createToken(jwt.sign({id: user[0].userID}, process.env.SECRET_KEY), user[0].userID,0)
    const verificationURL = `${process.env.CLIENT_URL}/verify/${user[0].userID}/${token[0].tokens}`;
    await SendEmail(user[0].userEmail, "Email Verification", `Hi there, \n You have set ${user[0].userEmail} as your registered email. Please click the link to verify your email: ` + verificationURL);
    return res.json({message: "Successfully signed up."})
    }
    catch(err)
    {
        console.log(err.message);
        return res.status(500).send({message: "Please contact technical support."})  
    }
})

router.post("/login", async (req,res) =>{
    try
    {
        const {email, password} = req.body;
        const user = await getUserByEmail(email)
        if(!user[0]){
            return res.json({ message: "Incorrect email or password. Please try again."});
        }
        const isValidatePassword = await bcrypt.compare(password,user[0].userPassword);

        if(!isValidatePassword){
            return res.json({ message: "Incorrect email or password. Please try again."});
        }

        const token = jwt.sign({id: user[0].userID}, process.env.SECRET_KEY);
        res.json({token, userID: user[0].userID});
    }
    catch(err)
    {
        console.log(err.message);
        return res.status(500).send({message: "Please contact technical support."})  
    }
})

router.get("/:id/verify/:token", async (req,res)=>{
    try
    {
        const user = await getUserByID(req.params.id)
        if(!user[0])
        {
            return res.json({ message: "Invalid link."});
        }
        else if(user[0].isVerified === 0)
        {
            const token = await getTokenByUserIDAndToken(user[0].userID,req.params.token)
            if(!token[0])
            {
                return res.json({ message: "Invalid link."});
            }
            else
            {
                await verifiedUser(user[0].userID)
                await deleteToken(user[0].userID,token[0].tokens,0)
                return res.json({message: "Email successfully verified."})
            }
        }
        else if(user[0].isVerified === 1)
        {
            return res.json({ message: "Email is already verified."});
        }
    }
    catch(err)
    {
        console.log(err.message);
        return res.status(500).send({message: "Please contact technical support."})  
    }
})


router.post('/reset', async (req,res)=>{
    try
    {
        const { email } = req.body;

        const user = await getUserByEmail(email)
        if(!user[0])
        {
            return res.json({ message: "Something went wrong. Please check if this email is signed up."});
        }
        else
        {
            const getToken = await getTokenByUserID(user[0].userID,1)
            if(!getToken[0])
            {
                const token = await createToken(jwt.sign({id: user[0].userID}, process.env.SECRET_KEY), user[0].userID, 1)
                const verificationURL = `${process.env.CLIENT_URL}/reset/${user[0].userID}/${token[0].tokens}`;
                await SendEmail(user[0].userEmail, "Reset Password", `Hi there, \n You have sent a request to reset your password. Please click the link to reset your password: ` + verificationURL);
                return res.json({message: "Successfully sent request."})
            }
            else
            {
                return res.json({message: "Request already sent. Please check your email."})
            }
        }
    }
    catch(err)
    {
        console.log(err.message);
        return res.status(500).send({message: "Please contact technical support."})  
    }
})

router.post("/:id/reset/:token", async (req,res)=>{
    try
    {
        const {password} = req.body
        const hashPassword = await bcrypt.hash(password, parseInt(process.env.SALT));
        const user = await getUserByID(req.params.id)
        if(!user[0])
        {
            return res.json({ message: "Invalid link."});
        }
        const token = await getTokenByUserIDAndToken(user[0].userID,req.params.token)
        if(!token[0])
        {
            return res.json({ message: "Invalid link."});
        }
        else
        {
            await resetPassword(user[0].userID,hashPassword)
            await deleteToken(user[0].userID,token[0].tokens,1)
            return res.json({message: "Password successfully reset."})
        }
    }
    catch(err)
    {
        console.log(err.message);
        return res.status(500).send({message: "Please contact technical support."})  
    }
})

router.get("/:id/reset/:token", async (req,res)=>{
    try
    {   
        const user = await getUserByID(req.params.id)
        const token = await getTokenByUserIDAndToken(user[0].userID,req.params.token)
        
        if(!user[0] || !token[0])
        {
            return res.json({ message: "Invalid link."});
        }

    res.json({ message: "Valid link."});

    }
    catch(err)
    {
        console.log(err.message);
        return res.status(500).send({message: "Please contact technical support."})  
    }
})

export {router as UsersRouter} 
