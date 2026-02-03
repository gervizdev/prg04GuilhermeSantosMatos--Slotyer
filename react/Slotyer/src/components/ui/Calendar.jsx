import React from 'react';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-day-picker/style.css';
import './Calendar.css';

function Calendar({
  className = '',
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      locale={ptBR}
      showOutsideDays={showOutsideDays}
      className={`slotyer-calendar ${className}`}
      {...props}
    />
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
