import connectDatabase from "@/dbConnect/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import UserModel from "@/models/User";

export async function DELETE(req : Request, {params} : {params : {messageId : string}}){
    const messageId = params.messageId
    await connectDatabase();
    const session = await getServerSession(authOptions)

    const user : User = session?.user as User;

    if(!session || !session.user){
        return Response.json({
            success : false,
            message : "Not authenticated"
        },{status : 401})
    }

    try {
        
        let updatedMessage = await UserModel.updateOne(
            {_id : user._id},
            {$pull : {message : {_id : messageId}}}
        )

        if(updatedMessage.modifiedCount === 0){
            return Response.json({
                success : false,
                message : "Message not found"
            },{status : 404})
        }

        return Response.json({
            success : true,
            message : "Message deleted successfully"
        },{status : 200})

    } catch (error) {
        return Response.json({
            success : false,
            message : "Failed to delete message"
        }, {status : 500})
    }
}