'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function UIShowcase() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">AskToddy UI Components</h1>
          <p className="text-muted-foreground">Modern shadcn/ui components with Toddy Orange branding</p>
        </div>
        
        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Various button styles and sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex gap-4 flex-wrap">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Forms */}
        <Card>
          <CardHeader>
            <CardTitle>Form Components</CardTitle>
            <CardDescription>Inputs, labels, and form elements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input id="project-name" placeholder="Kitchen renovation" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (£)</Label>
                <Input id="budget" type="number" placeholder="5000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe your project in detail..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Data Features */}
        <Card>
          <CardHeader>
            <CardTitle>Data Organization</CardTitle>
            <CardDescription>Perfect for your data collection features</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tools" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tools">Tool Hire</TabsTrigger>
                <TabsTrigger value="labor">Labor Costs</TabsTrigger>
                <TabsTrigger value="materials">Materials</TabsTrigger>
              </TabsList>
              <TabsContent value="tools" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold">Drill</h4>
                      <p className="text-sm text-muted-foreground">£25/day</p>
                      <Badge variant="secondary">Available</Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold">Mixer</h4>
                      <p className="text-sm text-muted-foreground">£45/day</p>
                      <Badge variant="secondary">Available</Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold">Saw</h4>
                      <p className="text-sm text-muted-foreground">£35/day</p>
                      <Badge variant="outline">Popular</Badge>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="labor">
                <p className="text-muted-foreground">Labor cost data would go here...</p>
              </TabsContent>
              <TabsContent value="materials">
                <p className="text-muted-foreground">Materials pricing data would go here...</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Progress for AI Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis Progress</CardTitle>
            <CardDescription>Show progress during AI processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analyzing images...</span>
                <span>60%</span>
              </div>
              <Progress value={60} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Calculating costs...</span>
                <span>85%</span>
              </div>
              <Progress value={85} />
            </div>
          </CardContent>
        </Card>

        {/* Dialog Example */}
        <Card>
          <CardHeader>
            <CardTitle>Dialogs & Modals</CardTitle>
            <CardDescription>For confirmations and detailed views</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button>View Project Details</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Kitchen Renovation Project</DialogTitle>
                  <DialogDescription>
                    Complete project details and AI analysis results.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Estimated Cost</h4>
                    <p className="text-2xl font-bold text-primary">£4,250</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Timeline</h4>
                    <p>5-7 working days</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}