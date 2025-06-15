import { useTranslation } from 'react-i18next';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'default';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = 'destructive',
}) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px] bg-background border-cyber-cyan-30'>
        <DialogHeader>
          <DialogTitle className='text-cyber-cyan'>{title}</DialogTitle>
          <DialogDescription className='text-gray-400'>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={onClose} className='border-cyber-cyan-30'>
            {cancelText || t('common.cancel')}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            className={
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 border-red-500'
                : 'bg-cyber-cyan hover:bg-cyber-cyan-80 border-cyber-cyan'
            }
          >
            {confirmText || t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
