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
        <CyberCard title={title} theme={variant === 'destructive' ? 'error' : 'primary'} size='lg'>
          <div className='space-y-6 p-2'>
            {/* Description */}
            <div className='text-center'>
              <div className='text-theme-foreground text-sm'>{description}</div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-center gap-3'>
              <Button
                variant='outline'
                onClick={onClose}
                className='px-6 py-2 border-theme-primary/30 text-theme-foreground hover:bg-theme-primary/10'
              >
                {cancelText || t('common.cancel')}
              </Button>
              <Button
                onClick={handleConfirm}
                className={`px-6 py-2 font-bold transition-all duration-300 transform hover:scale-105 relative overflow-hidden font-mono ${
                  variant === 'destructive'
                    ? 'bg-gradient-to-r from-theme-error to-theme-error/80 hover:from-theme-error/80 hover:to-theme-error/60 shadow-[0_0_20px_rgba(var(--theme-error),0.3)] hover:shadow-[0_0_30px_rgba(var(--theme-error),0.5)] border border-theme-error/50'
                    : 'bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-primary/80 hover:to-theme-accent/80 shadow-[0_0_20px_rgba(var(--theme-primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--theme-primary),0.5)] border border-theme-primary/50'
                }`}
              >
                <div
                  className={`absolute inset-0 blur-sm ${
                    variant === 'destructive'
                      ? 'bg-gradient-to-r from-theme-error/20 to-theme-error/20'
                      : 'bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20'
                  }`}
                />
                <span className='relative'>{confirmText || t('common.confirm')}</span>
              </Button>
            </div>
          </div>
        </CyberCard>
      </div>
    </div>
  );
};
