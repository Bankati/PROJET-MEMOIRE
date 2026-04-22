"use client";
/**
 * Barre de filtres avancés de la page Statistiques.
 * Sélection campagne + dates de début/fin avec composants interactifs.
 */
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Filter, Sparkles } from "lucide-react";

import { LbsDatePicker } from "@/components/ui/date-picker";
import { CampaignSelect } from "@/components/ui/campaign-select";

type CampaignOption = Readonly<{ id: string; title: string }>;
type AnalyticsFiltersProps = Readonly<{
  campaigns: readonly CampaignOption[];
  currentCampaign: string;
  currentFrom: string;
  currentTo: string;
}>;

export const AnalyticsFilters = ({
  campaigns,
  currentCampaign,
  currentFrom,
  currentTo,
}: AnalyticsFiltersProps): React.JSX.Element => {
  const router = useRouter();
  const [dateFrom, setDateFrom] = useState<string>(currentFrom);
  const [dateTo, setDateTo] = useState<string>(currentTo);
  const handleApply = useCallback((): void => {
    const params: URLSearchParams = new URLSearchParams();
    const campaignInput: HTMLInputElement | null = document.querySelector<HTMLInputElement>("input[name='campaign']");
    const campaignValue: string = campaignInput?.value ?? "";
    if (campaignValue.length > 0) {
      params.set("campaign", campaignValue);
    }
    if (dateFrom.length > 0) {
      params.set("from", dateFrom);
    }
    if (dateTo.length > 0) {
      params.set("to", dateTo);
    }
    const qs: string = params.toString();
    router.push(`/dashboard/super-admin/analytics${qs.length > 0 ? `?${qs}` : ""}`);
  }, [dateFrom, dateTo, router]);
  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]" suppressHydrationWarning>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        <Filter className="size-4 text-lbs-blue" />
        Filtres avancés
      </h3>
      <div className="grid items-end gap-3 md:grid-cols-4" suppressHydrationWarning>
        <CampaignSelect
          name="campaign"
          label="Campagne"
          options={campaigns}
          defaultValue={currentCampaign}
        />
        <LbsDatePicker
          label="Date de début"
          name="from"
          defaultValue={currentFrom}
          onValueChange={(v) => setDateFrom(v)}
        />
        <LbsDatePicker
          label="Date de fin"
          name="to"
          defaultValue={currentTo}
          onValueChange={(v) => setDateTo(v)}
        />
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] text-sm font-medium text-white shadow-sm transition hover:brightness-110"
          >
            <Sparkles className="size-3.5" />
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
};
