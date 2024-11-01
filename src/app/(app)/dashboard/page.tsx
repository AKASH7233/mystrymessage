'use client';

import Cards from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/models/User";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

function page() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading,setIsLoading] = useState(false)
  const [isToggleLoading,setIsToggleLoading] = useState(false)

  const { toast } = useToast()

  const handleDeleteMessage = (messageId : string) => {
    setMessages(messages.filter((message) => message._id !== messageId))
  }

  const { data : session } = useSession()

  const form = useForm({
    resolver : zodResolver(acceptMessageSchema),
  })

  const {register , watch , setValue} = form;

  const acceptMessages = watch('acceptMessages');

  const fetchIsAcceptMessage = useCallback(async () => {
    setIsToggleLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages')
      setValue('acceptMessages', response.data.isAcceptingMessage)
      console.log(response.data.isAcceptingMessage)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title : 'Error Fetching Accept Message Status',
        description : axiosError?.response?.data?.message?? "An Error Occurred",
        variant : "destructive"
      })
    } finally {
      setIsToggleLoading(false)
    }
  }, [setValue])

  const fetchMessages = useCallback(async (refresh : boolean = false) => {
    setIsToggleLoading(false)
    setIsLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/get-messages')
      setMessages(response.data.messages || [])
      console.log('messages',response.data)
      if(refresh){
        toast({
          title : 'Messages Fetched Successfully',
          description : 'Fetched Messages after refreshing the tab'
        })
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title : 'Error Fetching Accept Message Status',
        description : axiosError?.response?.data?.message?? "An Error Occurred",
        variant : "destructive"
      })
    } finally {
      setIsLoading(false)
      setIsToggleLoading(false)
    }
  }, [setIsLoading,setMessages])

  useEffect(()=>{
    if(!session  || !session.user) return;
    fetchIsAcceptMessage();
    fetchMessages();
  },[fetchIsAcceptMessage, fetchMessages, session , setValue])


  const handleSwitchToggle = async() => {
    try {
      const response = await axios.post('/api/accept-messages', {
        acceptMessages : !acceptMessages
      })
      console.log('toggled', response.data.isAcceptingMessage)
      setValue('acceptMessages', response.data.isAcceptingMessage)
      toast({
        title : 'Accept Message Status Changed Successfully'
      })
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title : 'Error Fetching Accept Message Status',
        description : axiosError?.response?.data?.message?? "An Error Occurred",
        variant : "destructive"
      })
    }
  }

  if(!session || !session.user){
    return <div>Please Sign In</div>
  }

  const { username } = session?.user as User;

  const BaseUrl = window.location.origin
  
  const profileUrl = BaseUrl + `/u/${username}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    toast({
      title : 'Profile URL Copied Successfully',
      description : 'URL has been copied to your clipboard'
    })
  } 

  return (
    <div className="my-8 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Unique Link</h2>{' '}
        <div className="flex items-center">
          <input 
          type="text"
          value={profileUrl}
          disabled
          className="input input-borderd w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch 
        {...register('acceptMessages')}
        checked = {acceptMessages}
        onCheckedChange={handleSwitchToggle}
        disabled={isToggleLoading}
        />
        <span className="ml-2">
          Accept Messages : {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>
      <Separator />

      <Button
      className="mt-4"
      variant= "outline"
      onClick={(e)=>{
        e.preventDefault()
        fetchMessages(true)
      }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin"/>
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages?.length > 0 ? (
          messages?.map((message)=>(
            <Cards 
              key={message?._id as string}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>

    </div>
  )
}

export default page