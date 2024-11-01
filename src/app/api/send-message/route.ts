import connectDatabase from "@/dbConnect/dbConnect";
import UserModel, { Message } from "@/models/User";


export async function POST(req : Request){
    await connectDatabase();

    try {
        const { username , content } = await req.json();

        const user = await UserModel.findOne({ username });

        if(!user){
            return Response.json({
                success : false,
                message : "User not found"
            },{status : 404});
        }

        const message = {content : content, createdAt : new Date()}

        if(!user.isAcceptingMessage){
            return Response.json({
                success : true,
                message : "User is not accepting messages"
            },{status : 200});
        }

        user.message.push(message as Message);
        await user.save();

        return Response.json({
            success : true,
            message : "Message sent successfully",
            messages : message
        },{status : 200});

    } catch (error) {
        console.log('Failed to send Message !')
        return Response.json({
            success : false,
            message : error ?? "An error occurred while sending message"
        },{status : 500});
    }
}