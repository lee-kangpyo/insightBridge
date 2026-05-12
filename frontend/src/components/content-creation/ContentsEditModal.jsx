import Modal from '../common/Modal';
import ContentsCreateForm from './ContentsCreateForm';

export default function ContentsEditModal({ isOpen, onClose, content, onSaved }) {
  return (
    <Modal
      isOpen={isOpen}
      title="컨텐츠 수정"
      description="선택된 컨텐츠의 설정을 수정합니다."
      variant="form"
      onClose={() => onClose?.()}
    >
      <ContentsCreateForm
        mode="edit"
        initialContent={content}
        onCancel={onClose}
        onSaved={(res) => {
          onSaved?.(res);
          onClose?.();
        }}
      />
    </Modal>
  );
}

