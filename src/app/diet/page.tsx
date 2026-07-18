import { DietTables } from "./DietTables";

export default function DietPage() {
  return (
    <main className="px-5 pb-6">
      <h1 className="pt-8 text-[30px] font-bold tracking-tight">Diet</h1>
      <div className="mt-4">
        <DietTables />
      </div>
    </main>
  );
}
