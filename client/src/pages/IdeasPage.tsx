
import { useUser } from '../hooks/use-user';
import { IdeasDashboard } from '../components/IdeasDashboard';
import { DormantConcepts } from '../components/DormantConcepts';
import { CreativeInsights } from '../components/CreativeInsights';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function IdeasPage() {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please log in to view your ideas.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Tabs defaultValue="garden">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="garden">Idea Garden</TabsTrigger>
          <TabsTrigger value="dormant">Forgotten Wisdoms</TabsTrigger>
          <TabsTrigger value="creative">Creative Bridges</TabsTrigger>
        </TabsList>

        <TabsContent value="garden" className="mt-6">
          <IdeasDashboard userId={user.id} />
        </TabsContent>

        <TabsContent value="dormant" className="mt-6">
          <DormantConcepts userId={user.id} />
        </TabsContent>

        <TabsContent value="creative" className="mt-6">
          <CreativeInsights userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
