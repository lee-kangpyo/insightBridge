import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { ADMIN_PAGE_CONTAINER_CLASS } from '../../constants/adminLayout';
import { getTemplateList } from '../../services/adminApi';
import TemplateGrid from '../../components/admin/ScreenConfig/TemplateGrid';

export default function TemplateSelectPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await getTemplateList();
        setTemplates(data);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    navigate(`/admin/screen-config/${template.template_id}`);
  };

  return (
    <div className={ADMIN_PAGE_CONTAINER_CLASS}>
      <PageHeader
        title="템플릿 선택"
        description="템플릿을 선택하여 새 화면을 구성하세요."
      />

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <span className="text-on-surface-variant">Loading...</span>
        </div>
      ) : (
        <>
          <TemplateGrid
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleSelectTemplate}
          />

          {selectedTemplate && (
            <div className="mt-6 p-4 bg-surface-container-low rounded-xl border border-outline/20">
              <h3 className="font-semibold text-lg text-on-surface mb-2">
                선택된 템플릿
              </h3>
              <div className="text-sm text-on-surface-variant space-y-1">
                <p>
                  <span className="font-medium">ID:</span> {selectedTemplate.template_id}
                </p>
                <p>
                  <span className="font-medium">이름:</span> {selectedTemplate.name}
                </p>
                <p>
                  <span className="font-medium">슬롯 수:</span>{' '}
                  {selectedTemplate.slots?.length || 0}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
