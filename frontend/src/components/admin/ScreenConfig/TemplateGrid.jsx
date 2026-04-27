import TemplateCard from './TemplateCard';

export default function TemplateGrid({ templates, selectedTemplate, onSelectTemplate }) {
  if (!templates || templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-on-surface-variant">
        템플릿이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {templates.map((template) => (
        <TemplateCard
          key={template.template_id}
          template={template}
          isSelected={selectedTemplate?.template_id === template.template_id}
          onClick={() => onSelectTemplate(template)}
        />
      ))}
    </div>
  );
}