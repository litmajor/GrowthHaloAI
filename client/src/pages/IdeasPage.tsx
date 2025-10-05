
import { useUser } from '../hooks/use-user';
import { IdeasDashboard } from '../components/IdeasDashboard';

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
      <IdeasDashboard userId={user.id} />
    </div>
  );
}
