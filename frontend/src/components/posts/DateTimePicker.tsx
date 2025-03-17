import { Calendar, Clock } from "lucide-react";
import { format, isToday } from "date-fns";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../../lib/utils";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

const DateTimePicker = ({ value, onChange, disabled }: DateTimePickerProps) => {
  

  const now = new Date();
  const date = value ? new Date(value) : now;

  const currentDate = format(now, "yyyy-MM-dd");
  const currentTime = format(now, "HH:mm");

  const selectedDateIsToday = isToday(date);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(date);
    const [year, month, day] = e.target.value.split("-");
    newDate.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));

    if (isToday(newDate)) {
      const currentTimeDate = new Date();
      if (newDate.getTime() < currentTimeDate.getTime()) {
        newDate.setHours(
          currentTimeDate.getHours(),
          currentTimeDate.getMinutes()
        );
      }
    }

    onChange(newDate.toISOString());
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(date);
    const [hours, minutes] = e.target.value.split(":");
    newDate.setHours(parseInt(hours), parseInt(minutes));

    if (selectedDateIsToday) {
      const currentTimeDate = new Date();
      if (newDate.getTime() < currentTimeDate.getTime()) {
        newDate.setHours(
          currentTimeDate.getHours(),
          currentTimeDate.getMinutes()
        );
      }
    }

    onChange(newDate.toISOString());
  };

  return (
    <div
      className={cn(
        disabled ? "pointer-events-none opacity-50" : "",
        "space-y-4"
      )}
    >
      {/* Date Input */}
      <div>
        <Label
          className={cn(
            "flex items-center gap-2 text-sm font-medium mb-2",
             "text-theme-light-secondary"
          )}
        >
          <Calendar
            className={cn(
              "w-4 h-4",
               "text-theme-light-secondary"
            )}
          />
          Date
        </Label>
        <Input
          type="date"
          value={format(date, "yyyy-MM-dd")}
          min={currentDate}
          onChange={handleDateChange}
          className={cn(
            "w-full",
             "bg-white border-gray-200 text-theme-light-primary"
          )}
        />
      </div>

      {/* Time Input */}
      <div>
        <Label
          className={cn(
            "flex items-center gap-2 text-sm font-medium mb-2",
             "text-theme-light-secondary"
          )}
        >
          <Clock
            className={cn(
              "w-4 h-4",
               "text-theme-light-secondary"
            )}
          />
          Time
        </Label>
        <Input
          type="time"
          value={format(date, "HH:mm")}
          min={selectedDateIsToday ? currentTime : undefined}
          onChange={handleTimeChange}
          className={cn(
            "w-full",
            "bg-white border-gray-200 text-theme-light-primary"
          )}
        />
      </div>
    </div>
  );
};

export default DateTimePicker;
