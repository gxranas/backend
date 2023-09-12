import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_ROOT,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
}).promise()

export async function getUserByID(id) {
    const [user] = await pool.query("SELECT * FROM Users WHERE userID = ? AND isEnabled = 1", [id])
    return user
}

export async function getUserByEmail(email){
    const [user] = await pool.query("SELECT * FROM Users WHERE userEmail = ? AND isEnabled = 1", [email])
    return user
}

export async function createUser(email,password,verified){
    const [result] = await pool.query(`
    INSERT INTO Users(
    userEmail,
    userPassword,
    isVerified) VALUES (?,?,?)`, [email,password,verified])
    return getUserByID(result.insertId)
}

export async function getTokenByID(id){
    const [token] = await pool.query("SELECT tokens,userID FROM Tokens WHERE tokenID = ?",[id])
    return token
}

export async function getTokenByUserIDAndToken(id,tokens){
    const [token] = await pool.query("SELECT tokens,userID FROM Tokens WHERE userID = ? AND tokens = ?",[id,tokens])
    return token
}

export async function getTokenByUserID(id, status){
    const [token] = await pool.query("SELECT tokens,userID FROM Tokens WHERE userID = ? AND isStatus = ?",[id,status])
    return token
}


export async function createToken(token,userid,status){
    const [generateToken] = await pool.query(`
    INSERT INTO Tokens(
    tokens,userID,isStatus
    ) VALUES (?,?,?)`, [token,userid,status])
    return getTokenByID(generateToken.insertId)
}

export async function verifiedUser(id)
{
    const [update] = await pool.query(`
    UPDATE Users 
    SET isVerified = 1 
    WHERE userID = ?`,[id])
    return [update]
}

export async function deleteToken(id,token,status)
{
    const [remove] = await pool.query(`
    DELETE FROM Tokens 
    WHERE userID = ? AND tokens = ? AND isStatus = ?`,[id,token,status])
    return [remove]
}

export async function resetPassword(id,password)
{
    const [reset] = await pool.query(`
    UPDATE Users
    SET userPassword = ? WHERE
    userID = ? AND isEnabled = 1`, [password,id])
    return [reset]
}