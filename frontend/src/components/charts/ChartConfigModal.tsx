import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';

export interface ChartConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartConfig: {
    chartType: string;
    title: string;
    xAxisName: string;
    yAxisName: string;
    titlePosition: 'left' | 'center' | 'right';
    legendPosition: 'top' | 'bottom' | 'left' | 'right';
  };
  onSave: (config: ChartConfigModalProps['chartConfig']) => void;
}

const TITLE_POSITIONS = ['left', 'center', 'right'] as const;
const LEGEND_POSITIONS = ['top', 'bottom', 'left', 'right'] as const;

export type TitlePosition = (typeof TITLE_POSITIONS)[number];
export type LegendPosition = (typeof LEGEND_POSITIONS)[number];

const inputClassName =
  'col-span-3 rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25';

export default function ChartConfigModal({
  isOpen,
  onClose,
  chartConfig,
  onSave,
}: ChartConfigModalProps) {
  const [localConfig, setLocalConfig] = useState({
    ...chartConfig,
    titlePosition: chartConfig.titlePosition ?? 'center',
  });

  const supportsXYAxisName = ![
    'treemap',
    'radar',
    'pie',
    'donut',
    'nightingale_rose',
  ].includes(localConfig.chartType);

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(chartConfig);
    }
  }, [isOpen, chartConfig]);

  const handleSave = () => {
    const nextConfig = supportsXYAxisName
      ? localConfig
      : { ...localConfig, xAxisName: '', yAxisName: '' };
    onSave(nextConfig);
    onClose();
  };

  const handleChange = <K extends keyof typeof localConfig>(
    key: K,
    value: (typeof localConfig)[K]
  ) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      title="차트 설정"
      variant="dialog"
      zIndexClassName="z-[100]"
      onClose={() => onClose()}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-outline bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface shadow-sm hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-on-secondary shadow-sm hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest"
          >
            적용
          </button>
        </div>
      }
    >
      <div className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-3">
            <label className="text-sm text-on-surface-variant">차트 제목</label>
            <input
              type="text"
              value={localConfig.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={inputClassName}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-3">
            <label className="text-sm text-on-surface-variant">X축 이름</label>
            <input
              type="text"
              value={localConfig.xAxisName}
              onChange={(e) => handleChange('xAxisName', e.target.value)}
              className={`${inputClassName} ${supportsXYAxisName ? '' : 'cursor-not-allowed opacity-60'}`}
              disabled={!supportsXYAxisName}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-3">
            <label className="text-sm text-on-surface-variant">Y축 이름</label>
            <input
              type="text"
              value={localConfig.yAxisName}
              onChange={(e) => handleChange('yAxisName', e.target.value)}
              className={`${inputClassName} ${supportsXYAxisName ? '' : 'cursor-not-allowed opacity-60'}`}
              disabled={!supportsXYAxisName}
            />
          </div>

          {!supportsXYAxisName && (
            <p className="-mt-2 text-xs text-on-surface-variant">
              이 차트 타입에서는 X/Y축 이름 설정을 지원하지 않습니다.
            </p>
          )}

          <div className="grid grid-cols-4 items-center gap-3">
            <label className="text-sm text-on-surface-variant">타이틀 위치</label>
            <select
              value={localConfig.titlePosition}
              onChange={(e) => handleChange('titlePosition', e.target.value as TitlePosition)}
              className={inputClassName}
            >
              {TITLE_POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-4 items-center gap-3">
            <label className="text-sm text-on-surface-variant">범례 위치</label>
            <select
              value={localConfig.legendPosition}
              onChange={(e) => handleChange('legendPosition', e.target.value as typeof localConfig.legendPosition)}
              className={inputClassName}
            >
              {LEGEND_POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
        </div>
    </Modal>
  );
}
