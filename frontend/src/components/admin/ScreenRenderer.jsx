import SlotItemRenderer from '../SlotItemRenderer';

function slotToGridStyle(slot) {
  const x = slot.x_pos ?? slot.x ?? 0;
  const y = slot.y_pos ?? slot.y ?? 0;
  const w = slot.width ?? slot.w ?? 1;
  const h = slot.height ?? slot.h ?? 1;
  return {
    gridColumn: `${x + 1} / span ${w}`,
    gridRow: `${y + 1} / span ${h}`,
  };
}

export default function ScreenRenderer({ slots, className = '', style = {} }) {
  return (
    <div
      className={`grid gap-4 bg-surface-container-lowest rounded-2xl border border-outline/10 p-6 shadow-lg ${className}`}
      style={{
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridTemplateRows: 'repeat(6, 70px)',
        ...style,
      }}
    >
      {slots.map((slot) =>
        slot.item_id ? (
          <div
            key={slot.slot_id}
            className="bg-surface rounded-xl border border-outline/15 overflow-hidden"
            style={slotToGridStyle(slot)}
          >
            <SlotItemRenderer itemId={slot.item_id} />
          </div>
        ) : null
      )}
    </div>
  );
}
