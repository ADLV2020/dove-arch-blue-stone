import { createFileRoute, redirect } from "@tanstack/react-router";
import { ROOM_CODE_RE } from "@/lib/poker";
import { RoomGate } from "@/components/poker/room-view";

export const Route = createFileRoute("/sala/$code")({
  beforeLoad: ({ params }) => {
    if (!ROOM_CODE_RE.test(params.code)) {
      throw redirect({ to: "/" });
    }
  },
  component: SalaPage,
});

function SalaPage() {
  const { code } = Route.useParams();
  return <RoomGate code={code} />;
}
