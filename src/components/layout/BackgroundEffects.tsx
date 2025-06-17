import { memo } from 'react';
import { useCurrentTheme } from '../../store/themeStore';

interface BackgroundEffectsProps {
  variant?: 'default' | 'minimal' | 'intense';
  className?: string;
}

/**
 * BackgroundEffects component for cyberpunk atmosphere
 *
 * Features:
 * - Animated floating orbs with different colors
 * - Grid pattern overlay
 * - Radial gradient effects
 * - Configurable intensity levels
 *
 * This component provides the visual foundation for the cyberpunk theme
 * and can be reused across different pages in React Router.
 */
const BackgroundEffects = memo(function BackgroundEffects({
  variant = 'default',
  className = '',
}: BackgroundEffectsProps) {
  const currentTheme = useCurrentTheme();

  // Define which themes should have gradients and effects
  const gradientThemes = ['cyberpunk', 'neon', 'retro'];
  const hasGradients = gradientThemes.includes(currentTheme);

  const getOrbsConfig = () => {
    switch (variant) {
      case 'minimal':
        return [
          { color: 'cyan', size: 'w-16 h-16', position: 'top-20 left-20', delay: '0s' },
          { color: 'purple', size: 'w-20 h-20', position: 'bottom-20 right-20', delay: '1s' },
        ];
      case 'intense':
        return [
          { color: 'cyan', size: 'w-32 h-32', position: 'top-10 left-10', delay: '0s' },
          { color: 'purple', size: 'w-40 h-40', position: 'bottom-10 right-10', delay: '1s' },
          { color: 'yellow', size: 'w-20 h-20', position: 'top-1/2 left-1/4', delay: '2s' },
          { color: 'green', size: 'w-24 h-24', position: 'top-1/3 right-1/3', delay: '1.5s' },
          { color: 'red', size: 'w-16 h-16', position: 'bottom-1/3 left-1/2', delay: '2.5s' },
        ];
      default: // default
        return [
          { color: 'cyan', size: 'w-32 h-32', position: 'top-10 left-10', delay: '0s' },
          { color: 'purple', size: 'w-40 h-40', position: 'bottom-10 right-10', delay: '1s' },
          { color: 'yellow', size: 'w-20 h-20', position: 'top-1/2 left-1/4', delay: '2s' },
        ];
    }
  };

  const orbs = getOrbsConfig();

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Grid pattern overlay */}
      <div className='absolute inset-0 bg-grid-pattern opacity-5' />

      {/* Radial gradient effects - only for gradient themes */}
      {hasGradients && (
        <div className='absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50' />
      )}

      {/* Floating orbs */}
      {orbs.map((orb, index) => (
        <div
          key={`orb-${index}-${orb.color}`}
          className={`absolute ${orb.size} bg-${orb.color}-400 rounded-full opacity-10 blur-3xl animate-pulse`}
          style={{
            animationDelay: orb.delay,
            left: orb.position.includes('left-')
              ? orb.position.split(' ')[1]?.replace('left-', '')
              : undefined,
            right: orb.position.includes('right-')
              ? orb.position.split(' ')[1]?.replace('right-', '')
              : undefined,
            top: orb.position.includes('top-')
              ? orb.position.split(' ')[0]?.replace('top-', '')
              : undefined,
            bottom: orb.position.includes('bottom-')
              ? orb.position.split(' ')[0]?.replace('bottom-', '')
              : undefined,
          }}
        />
      ))}

      {/* Additional atmospheric effects for intense variant - only for gradient themes */}
      {variant === 'intense' && hasGradients && (
        <>
          <div className='absolute inset-0 bg-gradient-to-br from-theme-primary/5 via-transparent to-theme-secondary/5' />
          <div className='absolute inset-0 bg-noise-pattern opacity-[0.02]' />
        </>
      )}
    </div>
  );
});

export default BackgroundEffects;
