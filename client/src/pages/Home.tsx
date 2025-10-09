import ChatInterface from "../components/ChatInterface";

//todo: remove mock functionality - replace with real user phase data
export default function Home() {
  return (
    <ChatInterface 
      currentPhase="expansion"
      phaseConfidence={75}
    />
  );
}