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
      <DialogContent className='sm:max-w-[425px] bg-background border-theme-primary/30'>
        <DialogHeader>
          <DialogTitle className='text-theme-primary'>{title}</DialogTitle>
          <DialogDescription className='text-theme-muted'>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={onClose} className='border-theme-primary/30'>
            {cancelText || t('common.cancel')}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            className={
              variant === 'destructive'
                ? 'bg-theme-error hover:bg-theme-error/80 border-theme-error'
                : 'bg-theme-primary hover:bg-theme-primary/80 border-theme-primary'
            }
          >
            {confirmText || t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
