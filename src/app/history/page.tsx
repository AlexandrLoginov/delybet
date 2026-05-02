import { HistoryWithDevPro } from "@/components/history/history-with-dev-pro";

export const metadata = {
  title: "История · DelyBet",
};

function readIsPro(pro: string | string[] | undefined): boolean {
  if (typeof pro === "string") return pro === "true";
  if (Array.isArray(pro)) return pro[0] === "true";
  return false;
}

export default function HistoryPage({
  searchParams,
}: {
  searchParams: { pro?: string | string[] };
}) {
  return (
    <HistoryWithDevPro urlIsPro={readIsPro(searchParams.pro)} />
  );
}
