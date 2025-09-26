import ChatMessage from '../ChatMessage';

export default function ChatMessageExample() {
  //todo: remove mock functionality
  const mockMessages = [
    {
      message: "I notice you're in what feels like a stuck place. Looking at your recent patterns, this seems like a natural contraction phase after your expansion last month. What if this isn't stagnation, but integration?\n\nWhat from your recent growth is asking to be more deeply absorbed?",
      isBliss: true,
      timestamp: new Date(Date.now() - 300000),
      phase: "contraction" as const
    },
    {
      message: "I've been feeling like I'm not making any progress lately. Everything feels overwhelming.",
      isBliss: false,
      timestamp: new Date(Date.now() - 600000)
    },
    {
      message: "The halo of growth doesn't move in straight lines. Sometimes the most profound transformation happens in the spaces between visible progress. How might you honor this pause as preparation for what's emerging?",
      isBliss: true,
      timestamp: new Date(),
      phase: "renewal" as const
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {mockMessages.map((msg, index) => (
        <ChatMessage
          key={index}
          message={msg.message}
          isBliss={msg.isBliss}
          timestamp={msg.timestamp}
          phase={msg.phase}
        />
      ))}
    </div>
  );
}