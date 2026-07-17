import { DietTables } from "./DietTables";

export default function DietPage() {
  return (
    <main className="p-5 space-y-4">
      <h1 className="text-2xl font-bold">Diet</h1>
      <DietTables />
    </main>
  );
}
