
import { useUser } from '../hooks/use-user';
import { WisdomLibrary } from '../components/WisdomLibrary';

export default function WisdomPage() {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please log in to view your wisdom library.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <WisdomLibrary userId={user.id} />
    </div>
  );
}
