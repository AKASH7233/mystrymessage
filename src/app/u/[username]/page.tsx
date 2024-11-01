'use client'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { MessageSchema } from '@/schemas/messageSchema'
import { ApiResponse } from '@/types/ApiResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { BadgeX, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import messages from '@/message.json';

function page() {

    const { username } = useParams()
    const { toast } = useToast()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isAcceptingMessage, setIsAcceptingMessage] = useState('')
    const [messagesSet , setMessagesSet] = useState(messages)
    const [isFetching, setIsFetching] = useState(false)

    const form = useForm <z.infer<typeof MessageSchema>>({
        resolver : zodResolver(MessageSchema),
    })

    const fetchMessagesSuggestion = async() =>{
        console.log('cliked')
        setIsFetching(true)
        try {
            const response = await axios.get('/api/message-suggestion')
            setMessagesSet(response.data?.messages)
            console.log(response?.data?.messages)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title : 'Error',
                description : axiosError?.response?.data?.message?? 'Error Occurred',
                variant : 'destructive'
            })
        }finally{
            setIsFetching(false);
        }
    }

    const onSubmit = async(data : z.infer<typeof MessageSchema>) =>{
        setIsSubmitting(true)
        try {
            
            const response = await axios.post('/api/send-message    ',{
                username, content : data.content
            })

            if(response.data?.message == 'User is not accepting messages') {
                setIsAcceptingMessage(response.data?.message)
                return;
            }

            toast({
                title : 'Message Sent Successfully',
                description : 'Your message has been sent successfully',
            })

        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title : 'Error',
                description : axiosError?.response?.data?.message?? 'Error Occurred',
                variant : 'destructive'
            })
        }finally{
            setIsSubmitting(false);
        }
    }

  return (
    <div className='flex justify-center py-10'>
        <div className='w-2/4'>
            <div className='py-10'>
                <h2 className='text-center font-bold text-4xl'>Public Profile Link</h2>
                <div className='my-10'>
                    <p className='font-bold font-2xl mb-2'>Send Anonymous Message to @{username}</p>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                    <Textarea 
                                    placeholder="Enter the message to sent" 
                                    autoComplete="off"
                                    rows={5}
                                    {...field} 
                                    className='p-2 border rounded outline-none w-full resize-none'
                                    />
                                    </FormControl>
                                    {isAcceptingMessage && <p className={`text-sm flex items-center text-red-500`}>
                                    {isAcceptingMessage} <BadgeX className="ml-1 w-4 h-4" /></p>}
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <div className='flex justify-center w-full'>
                                <Button className="mt-4 " type="submit" disabled={isSubmitting}>
                                    {
                                    isSubmitting ? (
                                        <>
                                        <Loader2 className = "mr-2 h-4 w-4 animate-spin" /> Please Wait
                                        </>
                                    ) : ( 'Send' )
                                    }
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
            <div className='my-20'>
                <Button onClick={fetchMessagesSuggestion} className='text-lg mb-7'>
                    Suggest Messages
                </Button>
                <p className='mb-5'>Click on any message below to select it</p>

                <div className='px-5 py-4 border'>
                    <h2 className='font-bold text-lg my-2'>Messages</h2>
                    
                    <div className='space-y-3'>
                        {isFetching ? (
                            Array(3).fill("").map((_, index) => (
                                <h2
                                    key={index}
                                    className="border h-10 animate-pulse bg-gray-200 cursor-pointer py-2 text-center"
                                ></h2>
                            ))
                        ) : (
                            messagesSet?.map((message, index) => (
                                <h2
                                    key={index}
                                    onClick={() => form.setValue('content', message.content)}
                                    className='border cursor-pointer py-2 text-center'
                                >
                                    {message.content}
                                </h2>
                            ))
                        )}
                    </div>

                </div>
            </div>
            <div className='flex items-center justify-center'>
                <div className='space-y-6'>
                    <p className='-mx-4 font-semibold'>Get your own Dashboard</p>
                    <Button>
                        <Link href={'/sign-up'}>Create Account</Link>
                    </Button>
                </div>
            </div>
        </div>
    </div> 
  )
}

export default page