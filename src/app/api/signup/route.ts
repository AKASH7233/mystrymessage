import ConnectDB from "@/dbConnect/dbConnect"
import UserModel from "@/models/User"
import bcypt from "bcryptjs"
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail"

export async function POST(request : Request){
    await ConnectDB()

    try {
        
        const { username, email , password } = await request.json()

        const IsUsernameAvailable = await UserModel.findOne({ username, isVerified : true })
        
        if(!IsUsernameAvailable){
            return Response.json(
                {
                    success : false,
                    message : 'Username is not Available'
                },
                {
                    status : 409
                }
            )
        }

        const isUserExists =  await UserModel.findOne({ email })
        
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if(isUserExists){
           
            if(isUserExists.isVerified){
                return Response.json(
                    {
                        success : false,
                        message : 'User already exists'
                    },
                    {
                        status : 409
                    }
                )
            }else{
                const hashedPassword = await bcypt.hash(password,10)
                isUserExists.password = hashedPassword
                isUserExists.verifyCode = verifyCode
                isUserExists.verifyCodeExpiration = new Date(Date.now() + 3600000)
                await isUserExists.save()
            }

        }else{
            const hashedPassword = await bcypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 2)

            const newUser = new UserModel({
                username,
                email,
                password : hashedPassword,
                verifyCode,
                verifyCodeExpiration : expiryDate,
                isVerified : false,
                isAcceptingMessage : true,
                message : []    
            })

            await newUser.save()
        }

        const emailResponse = await sendVerificationEmail(
            username,
            email,
            verifyCode
        )

        if(!emailResponse.success){
            return Response.json(
                {
                    success : false,
                    message : emailResponse.message
                },{status : 500}
            )
        }

        return Response.json(
            {
                success : true,
                message : 'User registered successfully. Please Verify Your email !',
            }, {status : 200}
        )

    } catch (error) {
        console.error('Error while Registering user', error)
        return Response.json(
            {
                success : false,
                message : 'Error while registering user'
            },
            {
                status : 500
            }
        )
    }

}