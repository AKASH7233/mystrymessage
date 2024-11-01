import resend from "@/libs/resend";
import VerificationEmail from "../../emails/verificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(username : string , email : string , verifyCode : string ) : Promise<ApiResponse>{
    console.log("email", email)
    try {
            await resend.emails.send({
            from : 'www.mystrymsg.com',
            to : email,
            subject : 'Verify your MystryMessage account',
            react : VerificationEmail({ username, otp: verifyCode }),
        })

        return {success: true, message: "Verification email sent successfully"};
    } catch (error) {
        console.error('error sending verification email', error)
        return { success: false, message: 'Failed to send verification email' };
    }
}