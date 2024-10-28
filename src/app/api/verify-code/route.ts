import connectDatabase from "@/dbConnect/dbConnect";
import UserModel from "@/models/User";


export async function POST(req : Request) {
    await connectDatabase()

    try {
        
        const { username , code } = await req.json()

        const decodedUsername = decodeURIComponent(username);

        const user = await UserModel.findOne({ username : decodedUsername });

        if(!user){
            return Response.json({
                success : false,
                message : 'User not found'
            }, {status : 404})
        }   

        const isVerifiedCode = user.verifyCode == code;
        const isVerifyCodeNotExpired = new Date(user.verifyCodeExpiration ) > new Date();

        if(isVerifiedCode && isVerifyCodeNotExpired ){
            user.isVerified = true;
            await user.save()

            return Response.json({
                success : true,
                message : 'Account Verified Successfully !'
            }, {status : 200})
        }else if(!isVerifyCodeNotExpired){
            return Response.json({
                success : false,
                message  : 'Verfication Code Expired'
            },{status : 400})
        }
        else if(!isVerifiedCode){
            return Response.json({
                success : false,
                message : 'Invalid Verification Code'
            },{status : 400})
        }

    } catch (error) {
        console.error(error);
        return Response.json({
            success : false,
            message : 'An error occurred while Validating Code'
        }, {status : 200})
    }
}