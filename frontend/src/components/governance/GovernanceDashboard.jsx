import governanceData from '../../data/governance-data.json';
import PageTitleSection from '../main/PageTitleSection';
import StatusChips from '../main/StatusChips';
import { useEffect, useMemo, useState } from 'react';
import {
  getGovernanceKpis,
  getGovernanceComplianceTable,
  getGovernanceInsights,
} from '../../services/api';
import {
  GovernanceKPICards,
  GovernanceComplianceTable,
  GovernanceInsights,
} from './index';

function pickKpiCards(data) {
  if (!data) return null;
  if (Array.isArray(data.kpiCards) && data.kpiCards.length) return data.kpiCards;
  if (Array.isArray(data.items) && data.items.length) return data.items;
  return null;
}

function pickComplianceItems(data) {
  if (!data) return null;
  if (Array.isArray(data.complianceItems) && data.complianceItems.length) {
    return data.complianceItems;
  }
  if (Array.isArray(data.items) && data.items.length) return data.items;
  return null;
}

function pickInsights(data) {
  if (!data) return null;
  const ins = data.insights && typeof data.insights === 'object' ? data.insights : data;
  if (
    ins &&
    typeof ins === 'object' &&
    (ins.strengths ||
      ins.risks ||
      (Array.isArray(ins.actions) && ins.actions.length))
  ) {
    return ins;
  }
  return null;
}

export default function GovernanceDashboard() {
  const baseYear = governanceData.meta.baseYear;

  const [meta] = useState(governanceData.meta);
  const [filters] = useState(governanceData.filters);
  const [kpiCards, setKpiCards] = useState(governanceData.kpiCards);
  const [complianceItems, setComplianceItems] = useState(governanceData.complianceItems);
  const [insights, setInsights] = useState(governanceData.insights);

  const params = useMemo(
    () => ({
      screen_code: 'governance',
      screen_ver: 'v0.1',
      screen_base_year: baseYear,
      schl_nm: '충남대학교',
    }),
    [baseYear],
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [kpisResult, complianceResult, insightsResult] = await Promise.allSettled([
        getGovernanceKpis(params),
        getGovernanceComplianceTable(params),
        getGovernanceInsights(params),
      ]);

      if (cancelled) return;

      if (kpisResult.status === 'fulfilled') {
        const next = pickKpiCards(kpisResult.value);
        if (next) setKpiCards(next);
      }

      if (complianceResult.status === 'fulfilled') {
        const next = pickComplianceItems(complianceResult.value);
        if (next) setComplianceItems(next);
      }

      if (insightsResult.status === 'fulfilled') {
        const next = pickInsights(insightsResult.value);
        if (next) setInsights(next);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [params]);

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-6 space-y-8">
      <PageTitleSection
        title={meta.pageTitle}
        subtitle={meta.pageSubtitle}
        baseYear={meta.baseYear}
      />

      <StatusChips filters={filters} />
      <GovernanceKPICards kpiCards={kpiCards} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GovernanceInsights insights={insights} />
        <div className="lg:col-span-2">
          <GovernanceComplianceTable complianceItems={complianceItems} />
        </div>
      </div>
    </div>
  );
}
