import ChatInterface from '../ChatInterface';

export default function ChatInterfaceExample() {
  //todo: remove mock functionality
  return (
    <div className="w-full h-screen">
      <ChatInterface 
        currentPhase="contraction"
        phaseConfidence={68}
      />
    </div>
  );
}