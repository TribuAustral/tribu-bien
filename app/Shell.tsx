import Nav from "./Nav";
import { getClub } from "@/lib/data";

export default async function Shell({ children }: { children: React.ReactNode }) {
  const club = await getClub();
  return (
    <>
      <Nav club={club.nombre} />
      <main className="container">{children}</main>
    </>
  );
}
