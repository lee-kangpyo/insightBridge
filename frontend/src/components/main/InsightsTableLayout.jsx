export default function InsightsTableLayout({
  insightsComponent,
  tableComponent,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {insightsComponent}
      <div className="lg:col-span-2">{tableComponent}</div>
    </div>
  );
}