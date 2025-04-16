import Monicon from '@monicon/native';
import { memo, useState } from 'react';
import { Pressable, useColorScheme } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import { useTheme } from '../lib/useTheme';
import { Input } from './ui/input';

const formatDateTime = (date: Date) =>
  date.toLocaleString('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

interface DateTimeInputProps {
  selectedDateTime: Date;
  onDateTimeChange: (date: Date, dateIso: string) => void;
  disabled?: boolean;
}

const DateTimeInput = memo(
  ({ selectedDateTime, onDateTimeChange, disabled = false }: DateTimeInputProps) => {
    const theme = useTheme();
    const colorScheme = useColorScheme();

    const [dateTimeState, setDateTimeState] = useState<Date>(selectedDateTime);
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);

    const handleOpenDatePicker = () => {
      setIsDatePickerVisible(true);
    };

    const handleConfirmDate = (date: Date) => {
      setIsDatePickerVisible(false);
      // Update the state with selected date (year, month, day) and show the time picker
      setDateTimeState(date);
      setIsTimePickerVisible(true);
    };

    const handleCancelDate = () => {
      setIsDatePickerVisible(false);
    };

    const handleConfirmTime = (time: Date) => {
      setIsTimePickerVisible(false);
      // Update the time portion while preserving the selected date
      const newDateTime = new Date(dateTimeState);
      newDateTime.setHours(time.getHours());
      newDateTime.setMinutes(time.getMinutes());
      newDateTime.setSeconds(time.getSeconds());

      setDateTimeState(newDateTime);
      onDateTimeChange(newDateTime, newDateTime.toISOString());
    };

    const handleCancelTime = () => {
      setIsTimePickerVisible(false);
    };

    return (
      <>
        <Pressable onPress={handleOpenDatePicker} disabled={disabled}>
          <Input
            containerClassName="mb-4"
            readOnly
            value={formatDateTime(dateTimeState)}
            leftSection={<Monicon name="famicons:calendar-sharp" size={24} color={theme.text} />}
            rightSection={!disabled && <Monicon name="circum:edit" size={24} color={theme.text} />}
          />
        </Pressable>

        {/* Date Picker Modal */}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          date={dateTimeState}
          isDarkModeEnabled={colorScheme === 'dark'}
          themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
          onConfirm={handleConfirmDate}
          onCancel={handleCancelDate}
        />

        {/* Time Picker Modal */}
        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          date={dateTimeState}
          isDarkModeEnabled={colorScheme === 'dark'}
          themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
          onConfirm={handleConfirmTime}
          onCancel={handleCancelTime}
        />
      </>
    );
  }
);

export default DateTimeInput;
