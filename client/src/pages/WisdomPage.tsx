
import { useUser } from '../hooks/use-user';
import { WisdomLibrary } from '../components/WisdomLibrary';

export default function WisdomPage() {
  const { user } = useUser();
  const userId = user?.id || 'demo-user';

  return (
    <div className="container mx-auto py-8 px-4">
      <WisdomLibrary userId={userId} />
    </div>
  );
}
