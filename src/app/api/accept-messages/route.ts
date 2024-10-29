import connectDatabase from "@/dbConnect/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/models/User";


export async function POST(req : Request){
    await connectDatabase();

    const session = await getServerSession(authOptions)

    const user : User = session?.user as User;

    if(!session || !session.user){
        return Response.json({
            success : false,
            message : "Not authenticated"
        },{status : 401})
    }

    const userId = user?._id

    const { acceptMessages } = await req.json();
    
    try {
        
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessage : acceptMessages },
            { new : true }
        )

        if(!updatedUser){
            return Response.json({
                success : false,
                message : "Failed to update user status to accept messages"
            })
        }

        return Response.json({
            success : true,
            message : "User status to accept messages updated successfully"
        },{status : 200})
 
    } catch (error) {
        console.log("Failed to update user status to accept messages")
        return Response.json({
            success : false,
            message : "Failed to update user status to accept messages"
        },{status : 500})
    }
}

export async function GET(req : Request) {
    await connectDatabase();

    const session = await getServerSession(authOptions)

    const user : User = session?.user as User;

    if(!session || !session.user) {
        return Response.json({
            success : false,
            message : "Not authenticated"
        },{status : 401})
    }
    
    const userId = user?._id

    try {
        
        const foundUser = await UserModel.findById(userId);

        if(!foundUser){
            return Response.json({
                success : false,
                message : "User not found"
            },{status : 401})
        }

        return Response.json({
            success : true,
            message : "User found successfully",
            data : foundUser?.isAcceptingMessage
        },{status : 200})

    } catch (error) {
        console.log("Failed to get user Message acceptance status")
        return Response.json({
            success : false,
            message : "Failed to get user Message acceptance status"
        },{status : 500})
    }
}
    