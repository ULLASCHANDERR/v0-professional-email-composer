import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Type, Mail, Settings } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-balance mb-4">AI-Powered Text Tools</h1>
        <p className="text-xl text-muted-foreground text-pretty">
          Transform your writing with professional rephrasing and intelligent email composition.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/rephrase">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5 text-primary" />
                Rephrase Text
              </CardTitle>
              <CardDescription>Transform your text into professional, polished content</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Input any text and get it rephrased to sound more professional and clear.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/email-composer">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Email Composer
              </CardTitle>
              <CardDescription>Compose and manage email conversations with AI assistance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create, edit, and organize email drafts with conversation threading.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/settings">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Settings
              </CardTitle>
              <CardDescription>Configure your API key and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Set up your AI provider API key to enable all features.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
