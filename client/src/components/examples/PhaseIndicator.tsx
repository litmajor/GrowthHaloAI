import PhaseIndicator from '../PhaseIndicator';

export default function PhaseIndicatorExample() {
  //todo: remove mock functionality
  return (
    <div className="space-y-6 p-6 max-w-md">
      <PhaseIndicator 
        currentPhase="expansion" 
        confidence={78} 
        size="lg" 
      />
      <PhaseIndicator 
        currentPhase="contraction" 
        confidence={65} 
        size="md" 
      />
      <PhaseIndicator 
        currentPhase="renewal" 
        confidence={92} 
        size="sm" 
        showDescription={false}
      />
    </div>
  );
}