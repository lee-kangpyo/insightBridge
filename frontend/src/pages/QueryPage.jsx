import { useState } from 'react';
import { query } from '../services/api';
import ChartRenderer from '../components/ChartRenderer';

function QueryPage() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await query(question);
      setResult(data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d) => d.msg).join('; ')
            : err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>InsightBridge</h1>
      <p>자연어로 데이터를 쿼리하고 차트로 시각화합니다</p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="예: 월별 매출을 보여줘"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '로딩중...' : '쿼리 실행'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          오류: {error}
        </div>
      )}

      {result && (
        <div>
          <h3>SQL:</h3>
          <pre
            style={{
              backgroundColor: '#f5f5f5',
              padding: '10px',
              borderRadius: '4px',
              overflow: 'auto',
            }}
          >
            {result.sql}
          </pre>

          <h3>결과:</h3>
          <ChartRenderer data={result.data} />
        </div>
      )}
    </div>
  );
}

export default QueryPage;
