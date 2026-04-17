export default function PageHeader({ title, description, actions }) {
  return (
    <header className="flex flex-col gap-1">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline font-bold text-4xl text-primary tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-on-surface-variant max-w-2xl mt-1">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}