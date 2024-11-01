import { z } from 'zod'

export const MessageSchema = z.object({
    content : z.string().min(10, 'Content must be at least 8 characters long').max(200, 'Content must be at most 20 characters long'),
})