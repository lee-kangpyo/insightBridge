import ReactECharts from 'echarts-for-react';

function ChartRenderer({ data, chartType = 'line' }) {
  if (!data || data.length === 0) {
    return <div style={{ padding: '20px' }}>데이터가 없습니다</div>;
  }

  const columns = Object.keys(data[0]);
  const xKey = columns[0];
  const yKey = columns[1];

  const option = {
    title: {
      text: chartType === 'heatmap' ? 'Heatmap' : 'Chart',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: data.map((row) => row[xKey]),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        type: chartType === 'heatmap' ? 'heatmap' : chartType,
        data: data.map((row) => row[yKey]),
      },
    ],
  };

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ReactECharts option={option} />
    </div>
  );
}

export default ChartRenderer;
