import React from 'react';
import { Input } from '@/components/ui/input';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "0.00",
  id,
  className,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState<string>(
    value > 0 ? (value / 100).toFixed(2).replace('.', ',') : ''
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    
    // Remove tudo que não é número
    input = input.replace(/\D/g, '');
    
    // Atualiza o display com a formatação
    if (input === '') {
      setDisplayValue('');
      onChange(0);
    } else {
      // Converte para centavos (número inteiro)
      const numericValue = parseInt(input, 10);
      
      // Formata para exibição (ex: 100 = 1,00)
      const formatted = (numericValue / 100).toFixed(2).replace('.', ',');
      setDisplayValue(formatted);
      
      // Passa o valor em centavos para o onChange
      onChange(numericValue);
    }
  };

  const handleBlur = () => {
    if (displayValue === '') {
      setDisplayValue('');
    }
  };

  return (
    <Input
      id={id}
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
    />
  );
}
