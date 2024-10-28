import {z} from 'zod'
import { usernameValidation } from '@/schemas/signUpSchema'
import connectDatabase from '@/dbConnect/dbConnect'
import UserModel from '@/models/User'

const UsernameQuerySchema = z.object({
    username : usernameValidation
})


export async function GET(req : Request){
    
    await connectDatabase()

    try {
        
        const { searchParams } = new URL( req.url)

        const queryParam = {
            username : searchParams.get('username')
        }

        const result = UsernameQuerySchema.safeParse(queryParam);

        console.log(result)
        if(!result.success){
            const usernameError = result.error.format().username?._errors || [];

            return Response.json({
                success : false,
                message : usernameError?.length > 0 ? usernameError.join(', ') : 'Invalid username'
            }, {status : 400})
        }

        const { username } = result.data

        const existingUsernameVerified = await UserModel.findOne({ username, isVerified : true })

        if(existingUsernameVerified){
            return Response.json({
                success : false,
                message : 'Username is already taken'
            }, {status : 409})
        }

        return Response.json({
            success : true,
            message : 'Username is available'
        }, {status : 200})

    } catch (error) {
        console.error(error);
        return Response.json({
            success : false,
            message : 'An error occurred while fetching user data'
        }, {status : 200})
    }
}