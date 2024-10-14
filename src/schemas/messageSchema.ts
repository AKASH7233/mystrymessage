import { z } from 'zod'

export const MessageSchema = z.object({
    content  : z
     .string()
     .min( 4 , 'content size must be atleast of 4 letters' )
     .max( 1000, 'content size must be not exceed 1000 letters' ),
})