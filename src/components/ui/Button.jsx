import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import Icon from './Icon';

const VARIANTS = {
  primary:
    'bg-brandBlue text-white hover:bg-brandBlueDeep shadow-sm hover:shadow-lg border border-brandBlue hover:border-brandBlueDeep',
  secondary:
    'bg-white text-ink border border-rule hover:bg-surface hover:border-brandBlue/40',
  accent:
    'bg-brandCrimson text-white hover:bg-[#7a0429] shadow-sm hover:shadow-lg border border-brandCrimson',
  inverted: 'bg-white text-ink hover:bg-surface shadow-sm border border-white',
  ghost: 'bg-transparent text-ink border border-transparent hover:bg-surface',
  quiet:
    'bg-transparent text-brandBlue border border-brandBlue/30 hover:border-brandBlue hover:bg-brandBluePale',
};

const SIZES = {
  sm: 'text-[13px] px-4 py-2',
  md: 'text-[14px] px-5 py-2.5',
  lg: 'text-[15px] px-7 py-3.5',
};

export default function Button({
  to,
  href,
  variant = 'primary',
  size = 'md',
  withArrow = false,
  className,
  children,
  ...rest
}) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 font-display font-medium tracking-tight transition-all duration-200 whitespace-nowrap rounded-sm',
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  const content = (
    <>
      {children}
      {withArrow && <Icon name="arrow-right" className="w-4 h-4" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  );
}
