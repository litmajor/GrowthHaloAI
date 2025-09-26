import ChatInterface from "../components/ChatInterface";

//todo: remove mock functionality - replace with real user phase data
export default function Home() {
  return (
    <div className="h-[calc(100vh-73px)]">
      <ChatInterface 
        currentPhase="expansion"
        phaseConfidence={75}
      />
    </div>
  );
}