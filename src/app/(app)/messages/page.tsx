import MessagesView from "./MessagesView"

export const metadata = {
  title: "Messages | IslandHub",
  description: "Connect with campus vendors and students.",
}

export default function MessagesPage() {
  return (
    <div className="container mx-auto p-4 pt-6">
      <MessagesView />
    </div>
  )
}
