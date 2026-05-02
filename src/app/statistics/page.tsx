import { StatisticsWithDevPro } from "@/components/statistics/statistics-with-dev-pro";

export const metadata = {
  title: "Статистика · DelyBet",
};

function readIsPro(pro: string | string[] | undefined): boolean {
  if (typeof pro === "string") return pro === "true";
  if (Array.isArray(pro)) return pro[0] === "true";
  return false;
}

export default function StatisticsPage({
  searchParams,
}: {
  searchParams: { pro?: string | string[] };
}) {
  return (
    <StatisticsWithDevPro urlIsPro={readIsPro(searchParams.pro)} />
  );
}
