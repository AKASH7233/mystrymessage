import { AuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import UserModel from "@/models/User"
import bcyrpt from "bcryptjs"
import connectDatabase from "@/dbConnect/dbConnect"


export const authOptions : AuthOptions = {
    providers : [
        Credentials({
            name : "Credentials",
            credentials : {
                identifier : { label : "identifier", type : "text" },
                password : { label : "Password", type : "password" },
            },
            async authorize(credentials) : Promise<any>{
                if (!credentials) {
                    throw new Error("Credentials are required");
                  }
          
                  console.log(credentials)
                await connectDatabase()
                try {
                    const user  = await UserModel.findOne({ $or : [ {email : credentials?.identifier}, {username : credentials?.identifier}] })
                    console.log(user)
                    if(!user){
                        throw new Error("User not found")
                    }

                    if(!user.isVerified){
                        throw new Error("User not verified")
                    }

                    const isPasswordValid = await bcyrpt.compare(credentials.password, user.password)

                    if(!isPasswordValid){
                        throw new Error("Invalid password")
                    }
                    return user; 

                } catch (error : any) {
                    console.error(error);
                    throw new Error(error);
                    return null;
                }
            }
        })
    ],
    pages : {
        signIn : "/sign-in",
        signOut : "/signout",
        error : "/error",
    },
    session : {
        strategy : "jwt"
    },
    secret : process.env.NEXT_AUTH_SECRET,
    callbacks: {
        async jwt({token, user }) {
            if(user) {
                token._id  = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username?.toString();
            }
            return token
        },
        async session({session, token}) {
            if(token){
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            }
            return session
        }
    }
}