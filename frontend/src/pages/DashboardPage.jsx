import DashboardPageHeader from '../components/dashboard/DashboardPageHeader';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import RankingHeatmapCard from '../components/dashboard/RankingHeatmapCard';
import InstitutionSummaryPanel from '../components/dashboard/InstitutionSummaryPanel';
import StrategicInsightsCard from '../components/dashboard/StrategicInsightsCard';
import KpiTile from '../components/dashboard/KpiTile';
import { useState, useEffect } from 'react';
import rankingsService from '../services/rankings';
import UniversitySearch from '../components/rankings/UniversitySearch';
import IndicatorSelector from '../components/rankings/IndicatorSelector';

// Default values for initial load
const DEFAULT_SCHOOL = { 
  school_name: '서울대학교', 
  school_code: '00088',
  establishment_type: '국립대학법인',
  region: '서울'
};
const DEFAULT_INDICATORS = [
  { id: 'employment_rate_rank', label: '졸업생의 취업률' },
  { id: 'scholarship_ratio_rank', label: '장학금 비율' },
  { id: 'tuition_won_rank', label: '등록금(원)' }
];

export default function DashboardPage() {
  const [selectedSchool, setSelectedSchool] = useState(DEFAULT_SCHOOL);
  const [selectedIndicators, setSelectedIndicators] = useState(DEFAULT_INDICATORS);
  const [rankingData, setRankingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch comparison data when school or indicators change
  useEffect(() => {
    const fetchRankings = async () => {
      if (!selectedSchool || selectedIndicators.length === 0) return;
      
      setIsLoading(true);
      try {
        const indicatorIds = selectedIndicators.map(ind => ind.id);
        const data = await rankingsService.getComparison(selectedSchool.school_code, indicatorIds);
        setRankingData(data);
      } catch (error) {
        console.error('Failed to fetch ranking comparison:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, [selectedSchool, selectedIndicators]);

  const handleToggleIndicator = (indicator) => {
    setSelectedIndicators(prev => {
      const exists = prev.some(ind => ind.id === indicator.id);
      if (exists) {
        return prev.filter(ind => ind.id !== indicator.id);
      }
      if (prev.length >= 5) return prev;
      return [...prev, indicator];
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6">
      <section className="relative z-20 flex flex-col gap-6">
        <DashboardPageHeader school={selectedSchool} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* University Search Container */}
          <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-low/50 border border-outline-variant/10 p-5 backdrop-blur-sm shadow-sm transition-all hover:bg-surface-container-low">
            <h4 className="text-sm font-bold text-slate-700">기관 선택</h4>
            <UniversitySearch 
              onSelect={setSelectedSchool} 
              initialValue={selectedSchool}
            />
          </div>

          {/* Indicator Selector Container */}
          <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-low/50 border border-outline-variant/10 p-5 backdrop-blur-sm shadow-sm transition-all hover:bg-surface-container-low">
            <IndicatorSelector 
              selectedIndicators={selectedIndicators}
              onToggle={handleToggleIndicator}
            />
          </div>
        </div>

        {/* Selected Indicators Tags - Now below the selectors */}
        <div className="flex flex-col gap-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">선택된 지표</span>
            <div className="h-[1px] flex-1 bg-slate-100"></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedIndicators.length > 0 ? (
              selectedIndicators.map((ind) => (
                <div
                  key={ind.id}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-outline-variant/30 text-slate-700 shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5"
                >
                  <span>{ind.label}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleIndicator(ind)}
                    className="ml-0.5 rounded-full p-0.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    aria-label="제거"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <span className="text-xs italic text-slate-400">선택된 지표가 없습니다. 지표를 추가해주세요.</span>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-6">
        <RankingHeatmapCard 
          data={rankingData} 
          selectedIndicators={selectedIndicators} 
          isLoading={isLoading}
          schoolName={selectedSchool?.school_name}
        />
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-3">
          <InstitutionSummaryPanel />
          <StrategicInsightsCard />
        </div>
      </div>
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <KpiTile
          icon="trending_up"
          delta="+8.4%"
          label="등록 트렌드"
          title="신입생 선발 지수"
          deltaClassName="text-secondary group-hover:text-secondary-fixed"
        />
        <KpiTile
          icon="account_balance"
          delta="-1.5%"
          label="운영 효율성"
          title="시설 관리비"
          deltaClassName="text-on-tertiary-container group-hover:text-tertiary-fixed"
        />
        <KpiTile
          icon="verified_user"
          delta="Top 10%"
          label="컴플라이언스 현황"
          title="연구 윤리 감사"
          deltaClassName="text-secondary group-hover:text-secondary-fixed"
        />
      </section>
    </div>
  );
}
