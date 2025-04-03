'use client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { Suspense, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Place } from '@/db/places';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import OrderView from './order-view';
import {
  getUserIdFromSessionAction,
  isUserAdminAction
} from '@/actions/session';
import { toast } from 'sonner';
import { createPayoutAction } from './action';
import { useTranslations } from 'next-intl';

export default function SelectPlace({
  places,
  currencyLogo
}: {
  places: Place[] | null;
  currencyLogo: string;
}) {
  const t = useTranslations('addingpayout');
  const selectedPlaceRef = useRef<string | null>(null);
  const [placeid, setPlaceid] = useState<number | null>(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7)
  });

  //for get the date range from the date picker
  const dateRangeRef = useRef<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7)
  });

  // State to control when the table should be displayed
  const [isTableVisible, setIsTableVisible] = useState(false);

  // Function to handle showing order table
  const handleSelectionComplete = () => {
    if (selectedPlaceRef.current && dateRangeRef.current) {
      setIsTableVisible(true);
    }
  };

  return (
    <>
      {/* place Selector */}
      <div className="space-y-2">
        <label className="text-md font-medium">{t('places')}</label>
        <div className="flex w-full flex-col gap-2">
          <Select
            onValueChange={(value) => {
              setPlaceid(Number(value));
              selectedPlaceRef.current = value;
              handleSelectionComplete();
            }}
            value={selectedPlaceRef.current || undefined}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('selectplace')} />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto">
              <SelectGroup>
                {places?.map((place, index) => (
                  <SelectItem key={index} value={place.id.toString()}>
                    {place.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('dataRange')}</label>
        <div className="grid gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, 'LLL dd, y')} -{' '}
                      {format(date.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(date.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={(range) => {
                  setDate(range);
                  dateRangeRef.current = range;
                  handleSelectionComplete();
                }}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isTableVisible && (
        <Suspense fallback={<>Loading...</>}>
          <AsyncOrderTable
            place={placeid}
            dateRange={date}
            currencyLogo={currencyLogo}
          />
        </Suspense>
      )}
    </>
  );
}

function AsyncOrderTable({
  place,
  dateRange,
  currencyLogo
}: {
  place: number | null;
  dateRange: DateRange | undefined;
  currencyLogo: string;
}) {
  return (
    <OrderView
      place={place}
      dateRange={dateRange}
      currencyLogo={currencyLogo}
    />
  );
}
