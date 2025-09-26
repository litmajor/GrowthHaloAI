import DailyCheckIn from '../DailyCheckIn';

export default function DailyCheckInExample() {
  //todo: remove mock functionality  
  const handleComplete = (data: any) => {
    console.log('Check-in completed with data:', data);
  };

  return (
    <div className="p-6">
      <DailyCheckIn 
        currentPhase="contraction"
        onComplete={handleComplete}
      />
    </div>
  );
}