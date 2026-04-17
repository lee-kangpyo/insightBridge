import { useState } from 'react';
import { queryStream, refineQuery } from '../services/api';
import { CandidateTabs, BentoGridSkeleton } from '../components/bento';
import { RefineBar } from '../components/bento/RefineBar';
import { Search } from 'lucide-react';

function QueryPage() {
  const [question, setQuestion] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [bestIndex, setBestIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || isStreaming) return;

    setIsStreaming(true);
    setError(null);
    setCandidates([]);
    setBestIndex(-1);
    setActiveTab(0);
    setCurrentQuestion(question);

    await queryStream(
      question,
      (candidate) => {
        setCandidates((prev) => [...prev, candidate]);
      },
      (done) => {
        setBestIndex(done.best_index);
        setActiveTab(done.best_index >= 0 ? done.best_index : 0);
        setIsStreaming(false);
      },
      (err) => {
        setError(err.message || '조회 중 오류가 발생했습니다.');
        setIsStreaming(false);
      }
    );
  };

  const handleRefine = async (feedback) => {
    if (isRefining || isStreaming) return;

    setIsRefining(true);
    setError(null);

    const previousCandidates = candidates.map((c) => ({
      sql: c.sql,
      evaluation: c.evaluation || '',
    }));

    await refineQuery(
      currentQuestion,
      feedback,
      previousCandidates,
      (candidate) => {
        setCandidates((prev) => [...prev, candidate]);
      },
      (done) => {
        setBestIndex(done.best_index >= 0 ? done.best_index : bestIndex);
        setActiveTab(done.best_index >= 0 ? done.best_index : activeTab);
        setIsRefining(false);
      },
      (err) => {
        setError(err.message || '재조회 중 오류가 발생했습니다.');
        setIsRefining(false);
      }
    );
  };

  const hasResults = candidates.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-headline font-bold text-on-background mb-2">
            InsightBridge
          </h1>
          <p className="text-on-surface-variant text-sm">
            자연어로 데이터를 쿼리하고 차트로 시각화합니다
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="예: 월별 매출을 보여줘"
              className="w-full px-5 py-4 pr-12 text-base bg-surface-container-lowest border border-outline rounded-xl 
                         text-on-surface placeholder:text-on-surface-variant 
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                         transition-all duration-200"
            />
            <button
              type="submit"
              disabled={isStreaming || !question.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-lg bg-primary text-on-primary
                         hover:bg-primary-fixed-dim disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm">
            {error}
          </div>
        )}

        {isStreaming && !hasResults ? (
          <BentoGridSkeleton />
        ) : (
          <>
            <CandidateTabs
              candidates={candidates}
              bestIndex={bestIndex}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isStreaming={isStreaming}
            />

            {hasResults && (
              <RefineBar
                onRefine={handleRefine}
                isLoading={isRefining}
                disabled={isStreaming}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default QueryPage;