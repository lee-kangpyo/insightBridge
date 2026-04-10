const statusConfig = {
  compliant: {
    label: '준수',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  pending: {
    label: '진행중',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
  },
  'non-compliant': {
    label: '미준수',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
};

export default function GovernanceComplianceTable({ complianceItems }) {
  if (!complianceItems?.length) return null;

  return (
    <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/30">
        <h3 className="text-base font-semibold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-lg">verified_user</span>
          컴플라이언스 현황
        </h3>
        <button className="text-xs font-medium text-secondary flex items-center gap-1 hover:underline">
          전체보기
          <span className="material-symbols-outlined text-[12px]">open_in_new</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-highest/30">
              <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                구분
              </th>
              <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                항목
              </th>
              <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                기한
              </th>
              <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                책임부서
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {complianceItems.map((item) => {
              const status = statusConfig[item.status] || statusConfig.pending;
              return (
                <tr
                  key={item.id}
                  className="hover:bg-surface-container-low/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-surface-container-high text-[10px] font-semibold rounded text-slate-500">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">
                    {item.itemName}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 ${status.bgColor} ${status.textColor} text-[10px] font-bold rounded border ${status.borderColor}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {item.dueDate}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {item.responsibleParty}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
