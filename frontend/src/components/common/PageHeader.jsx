export default function PageHeader({ title, description, actions }) {
  return (
    <header className="flex flex-col gap-1 min-h-[80px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline font-bold text-4xl text-primary tracking-tight leading-tight">
            {title}
          </h1>
          <p
            className="text-sm text-on-surface-variant max-w-2xl mt-1.5 min-h-[2.625rem] line-clamp-2 leading-relaxed"
            title={description || ''}
          >
            {description || ''}
          </p>
        </div>
        {actions && <div className="flex items-center gap-3 ml-6 shrink-0 pt-1">{actions}</div>}
      </div>
    </header>
  );
}
