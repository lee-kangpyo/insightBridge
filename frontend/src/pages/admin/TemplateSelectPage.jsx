import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { ADMIN_PAGE_CONTAINER_CLASS } from '../../constants/adminLayout';
import {
  getTemplatesByDefault,
  createTemplate,
  deleteTemplate,
  getTemplateReferenceCount,
  handleApiError,
} from '../../services/adminApi';
import TemplateGrid from '../../components/admin/ScreenConfig/TemplateGrid';
import TemplateEditorModal from '../../components/admin/ScreenConfig/TemplateEditorModal';

export default function TemplateSelectPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('default'); // 'default' | 'custom'
  const [defaultTemplates, setDefaultTemplates] = useState([]);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteResult, setDeleteResult] = useState(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const [defaults, customs] = await Promise.all([
        getTemplatesByDefault(true),
        getTemplatesByDefault(false),
      ]);
      setDefaultTemplates(defaults);
      setCustomTemplates(customs);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    navigate(`/admin/screen-config/${template.template_id}`);
  };

  const handleSaveTemplate = async (payload) => {
    try {
      await createTemplate(payload);
      setIsModalOpen(false);
      await fetchTemplates();
    } catch (error) {
      alert(handleApiError(error, '템플릿 생성에 실패했습니다.'));
    }
  };

  const handleDeleteTemplate = (template) => {
    const refCount = template.reference_count || 0;
    if (refCount > 0) {
      setDeleteResult({
        success: false,
        templateName: template.name,
        message: `"${template.name}" 템플릿은 현재 ${refCount}개 화면에서 사용 중이므로 삭제할 수 없습니다.`,
      });
    } else {
      setDeleteConfirm(template);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteTemplate(deleteConfirm.template_id);
      setDeleteConfirm(null);
      setDeleteResult({ success: true, templateName: deleteConfirm.name });
      await fetchTemplates();
    } catch (error) {
      setDeleteConfirm(null);
      const msg = handleApiError(error, '템플릿 삭제에 실패했습니다.');
      setDeleteResult({ success: false, templateName: deleteConfirm.name, message: msg });
    }
  };

  const closeDeleteResult = () => {
    setDeleteResult(null);
  };

  const currentTemplates = activeTab === 'default' ? defaultTemplates : customTemplates;

  return (
    <div className={ADMIN_PAGE_CONTAINER_CLASS}>
      <PageHeader
        title="템플릿 선택"
        description="템플릿을 선택하여 새 화면을 구성하세요."
      />

      {/* Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          <button
            onClick={() => setActiveTab('default')}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'default'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            기본 템플릿
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'custom'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            커스텀 템플릿
          </button>
        </div>

        {activeTab === 'custom' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-sm font-medium bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors shadow-sm"
          >
            + 템플릿 추가
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <span className="text-on-surface-variant">Loading...</span>
        </div>
      ) : (
        <>
          <TemplateGrid
            templates={currentTemplates}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleSelectTemplate}
            onDeleteTemplate={activeTab === 'custom' ? handleDeleteTemplate : undefined}
            showDelete={activeTab === 'custom'}
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

      <TemplateEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTemplate}
      />

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirm(null);
          }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              템플릿 삭제
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              "{deleteConfirm.name}" 템플릿을 삭제하시겠습니까?
              {deleteConfirm.referenceCount > 0 && (
                <>
                  <br />
                  <span className="text-red-500 font-medium">
                    이 템플릿을 사용하는 화면이 {deleteConfirm.referenceCount}개 있습니다.
                  </span>
                </>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete result dialog */}
      {deleteResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDeleteResult();
          }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              {deleteResult.success ? '삭제 완료' : '삭제 실패'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              {deleteResult.success
                ? `"${deleteResult.templateName}" 템플릿이 삭제되었습니다.`
                : deleteResult.message || '템플릿 삭제에 실패했습니다.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteResult}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
