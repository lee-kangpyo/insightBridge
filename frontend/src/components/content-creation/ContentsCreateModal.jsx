import Modal from '../common/Modal';
import ContentsCreateForm from './ContentsCreateForm';

export default function ContentsCreateModal({
  isOpen,
  onClose,
  onSaved,
  mode = 'create',
  initialContent = null,
}) {
  const title = mode === 'clone' ? '컨텐츠 복제 생성' : '컨텐츠 생성';
  const description =
    mode === 'clone'
      ? '선택한 컨텐츠 설정을 복제하여 새 컨텐츠를 생성합니다.'
      : 'AI 쿼리와 차트·테이블·카드 설정을 조합하여 새로운 컨텐츠를 만듭니다.';

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      description={description}
      variant="form"
      onClose={() => onClose?.()}
    >
      <ContentsCreateForm
        mode={mode}
        initialContent={initialContent}
        onCancel={onClose}
        onSaved={(res) => {
          onSaved?.(res);
          onClose?.();
        }}
      />
    </Modal>
  );
}

