import connectDatabase from "@/dbConnect/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/models/User";
import mongoose from "mongoose";

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

    const userId = new mongoose.Types.ObjectId(user._id)

    try {
        
        const user = await UserModel.aggregate([
            {$match : {_id : userId}},
            {$unwind : "$message"},
            {$sort : {'message.createdAt' : -1}},
            {$group : {_id : '$_id', messages : {$push :  "$message"}}}
        ])

        if(!user || user.length === 0){
            return Response.json({
                success : false,
                message : "No messages found"
            },{status : 404})
        }

        return Response.json({
            success : true,
            data : user[0].messages
        },{status : 200})

    } catch (error) {
        console.log('Failed to fetch message from server');
        return Response.json({
            success : false,
            message : "Failed to fetch message from server"
        },{status : 500})
    }
}