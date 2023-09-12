import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { UsersRouter } from './src/route/authentication/Users.js'
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/auth', UsersRouter)

app.listen(process.env.PORT, ()=>{
    console.log("Server is running on port: "+ process.env.PORT);
})