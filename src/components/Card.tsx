'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "./ui/button"
import { X } from "lucide-react"
import { Message } from "@/models/User"
import { useToast } from "@/hooks/use-toast"
import axios from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import dayjs from 'dayjs';
  
type MessageCardProps = {
    message : Message,
    onMessageDelete : (id: string) => void,
}

const Cards = ({message , onMessageDelete} : MessageCardProps) => {
    const { toast } = useToast()

    const handleDeleteConfirm = async() => {
        let response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`)

        toast({
            title : 'Message Deleted Successfully',
            description : response.data?.message
        })
        onMessageDelete(message._id as string)
    }
  return (
    <Card className="card-bordered">
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle>{message.content}</CardTitle>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant='destructive'>
              <X className="w-5 h-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete
                this message.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="text-sm">
        {dayjs(message.createdAt).format('MMM D, YYYY h:mm A')}
      </div>
    </CardHeader>
    <CardContent></CardContent>
  </Card>
  )
}

export default Cards