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
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Suspense, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Place } from '@/db/places';
import { DataTable } from '@/components/ui/data-table';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { getOrdersAction } from './action';
import { dataLength } from 'ethers';
import { DataTableResetFilter } from '@/components/ui/table/data-table-reset-filter';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import OrderView from './order-view';

export default function SelectPlace({ places }: { places: Place[] | null }) {
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

  // Function to handle selection completion
  const handleSelectionComplete = () => {
    if (selectedPlaceRef.current && dateRangeRef.current) {
      setIsTableVisible(true);
    }
  };

  return (
    <>
      {/* place Selector */}
      <div className="space-y-2">
        <label className="text-md font-medium">Places</label>
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
              <SelectValue placeholder="Select a place" />
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
        <label className="text-sm font-medium">Date Range</label>
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
          <AsyncOrderTable place={placeid} dateRange={date} />
        </Suspense>
      )}

      <Button>Create Payout</Button>
    </>
  );
}

function AsyncOrderTable({
  place,
  dateRange
}: {
  place: number | null;
  dateRange: DateRange | undefined;
}) {
  return <OrderView place={place} dateRange={dateRange} />;
}
