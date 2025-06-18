import { useTranslation } from 'react-i18next';
import { Button } from './button';
import CyberCard from './CyberCard';

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

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/70 backdrop-blur-sm'
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role='button'
        tabIndex={0}
        aria-label='Close dialog'
      />

      {/* Dialog Content */}
      <div className='relative z-10 mx-4 w-full max-w-md'>
        <CyberCard title={title} theme={variant === 'destructive' ? 'muted' : 'primary'} size='lg'>
          <div className='space-y-6 p-2'>
            {/* Description */}
            <div className='text-center'>
              <div className='text-theme-foreground text-sm'>{description}</div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-center gap-3'>
              <Button variant='secondary' onClick={onClose}>
                {cancelText || t('common.cancel')}
              </Button>
              <Button
                onClick={handleConfirm}
                variant={variant === 'destructive' ? 'ghost' : 'primary'}
              >
                {confirmText || t('common.confirm')}
              </Button>
            </div>
          </div>
        </CyberCard>
      </div>
    </div>
  );
};
