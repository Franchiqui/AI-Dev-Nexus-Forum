import { Modal } from '@/components/ui/modal';
import ImageEditor from './ImageEditor';
import VideoEditor from './VideoEditor';
import AudioEditor from './AudioEditor';
import DocumentEditor from './DocumentEditor';
import { MediaFileType } from '@/types';
import { ImageEditState } from '@/types';

type EditorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (editState: ImageEditState) => void;
};

export default function EditorModal({ isOpen, onClose, imageUrl, onSave }: EditorModalProps) {
  const handleSave = (editState: ImageEditState) => {
    onSave(editState);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Editor de Imágenes"
      size="lg"
    >
      <ImageEditor 
        imageUrl={imageUrl}
        onSave={handleSave}
        onCancel={onClose}
      />
    </Modal>
  );
}
