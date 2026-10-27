import React, { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, containerClassName, label, id, required, ...props }, ref) => {
    const inputId = id || label.replace(/\s+/g, '-').toLowerCase() + (props.name ? `-${props.name}` : '');
    return (
      <div className={cn('input-group', containerClassName)}>
        <label htmlFor={inputId} className="field-label">{label}{required && <span className="required-indicator" title="Required">*</span>}</label>
        <input id={inputId} ref={ref} required={required} className={cn('field-input', className)} {...props} />
      </div>
    );
  }
);
Input.displayName = 'Input';
