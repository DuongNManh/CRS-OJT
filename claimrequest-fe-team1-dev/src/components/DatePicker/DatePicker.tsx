// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format as formatDate } from "date-fns";
import { XCircle } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

interface DatePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({
  startDate,
  endDate,
  onDateChange,
}) => {
  const { t } = useTranslation();

  const handleClear = () => {
    onDateChange(null, null);
  };

  return (
    <div className="flex gap-4 items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !startDate && "text-muted-foreground",
            )}
          >
            {startDate ? (
              formatDate(startDate, "dd/MM/yyyy")
            ) : (
              <span>{t("date_picker.pick_start_date")}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={(date) => onDateChange(date, endDate)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !endDate && "text-muted-foreground",
            )}
          >
            {endDate ? (
              formatDate(endDate, "dd/MM/yyyy")
            ) : (
              <span>{t("date_picker.pick_end_date")}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={(date) => onDateChange(startDate, date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {(startDate || endDate) && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="h-9 w-9 rounded-full"
          title={t("date_picker.clear_dates")}
        >
          <XCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </Button>
      )}
    </div>
  );
};

export default DatePicker;
