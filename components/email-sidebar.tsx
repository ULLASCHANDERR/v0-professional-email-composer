"use client"

import { useEmailConversations } from "@/hooks/use-email-conversations"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
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

export function EmailSidebar() {
  const { conversations, activeConversationId, setActiveConversationId, createNewConversation, deleteConversation } =
    useEmailConversations()

  const handleNewConversation = () => {
    createNewConversation()
  }

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id)
  }

  return (
    <div className="w-72 bg-sidebar border-r border-sidebar-border p-4 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Emails</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNewConversation}
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Plus className="h-5 w-5" />
          <span className="sr-only">New Conversation</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {conversations.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No conversations yet. Start a new one!</p>
        )}
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors group",
              activeConversationId === conv.id
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
            onClick={() => setActiveConversationId(conv.id)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{conv.subject}</p>
              <p className="text-xs text-muted-foreground group-hover:text-sidebar-accent-foreground/80">
                {new Date(conv.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "ml-2 opacity-0 group-hover:opacity-100 transition-opacity",
                    activeConversationId === conv.id && "opacity-100",
                  )}
                  onClick={(e) => e.stopPropagation()} // Prevent selecting conversation when clicking delete
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete Conversation</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your email conversation and remove its
                    data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteConversation(conv.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  )
}
