"use client"

import { useEmailConversationsContext } from "@/contexts/email-conversations-context"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, MoreVertical, Pin, PinOff, Pencil, Play } from "lucide-react"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function EmailSidebar() {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    createNewConversation,
    deleteConversation,
    renameConversation,
    togglePinConversation,
  } = useEmailConversationsContext()

  const handleNewConversation = () => {
    createNewConversation()
  }

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id)
  }

  const sortedConversations = [...conversations].sort((a, b) => {
    const ap = a.pinned ? 1 : 0
    const bp = b.pinned ? 1 : 0
    if (ap !== bp) return bp - ap
    return b.updatedAt - a.updatedAt
  })

  return (
    <div className="w-full md:w-72 bg-sidebar border-r border-sidebar-border p-4 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Conversations</h2>
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
        {sortedConversations.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No conversations yet. Start a new one!</p>
        )}
        {sortedConversations.map((conv) => (
          <div
            key={conv.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-md transition-colors group",
              activeConversationId === conv.id
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <button
              type="button"
              className="flex-1 min-w-0 text-left"
              onClick={() => setActiveConversationId(conv.id)} // continue/select
            >
              <p className="text-sm font-medium truncate">
                {conv.subject || "Untitled"}
                {conv.pinned && <span className="ml-2 text-xs opacity-80">• Pinned</span>}
              </p>
              <p className="text-xs text-muted-foreground group-hover:text-sidebar-accent-foreground/80">
                {new Date(conv.updatedAt).toLocaleDateString()}
              </p>
            </button>

            <div className="flex items-center gap-1">
              {/* existing delete */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "ml-1 opacity-0 group-hover:opacity-100 transition-opacity",
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
                    <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone and will remove this conversation permanently.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteConversation(conv.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "opacity-0 group-hover:opacity-100 transition-opacity",
                      activeConversationId === conv.id && "opacity-100",
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Conversation actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={6}>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveConversationId(conv.id)
                    }}
                  >
                    <Play className="mr-2 h-4 w-4" /> Continue
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      const name =
                        typeof window !== "undefined" ? window.prompt("Rename conversation", conv.subject) : null
                      if (name && name.trim().length > 0) {
                        renameConversation(conv.id, name.trim())
                      }
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      togglePinConversation(conv.id)
                    }}
                  >
                    {conv.pinned ? (
                      <>
                        <PinOff className="mr-2 h-4 w-4" /> Unpin
                      </>
                    ) : (
                      <>
                        <Pin className="mr-2 h-4 w-4" /> Pin
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
