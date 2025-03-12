'use client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { CalendarIcon, CheckIcon, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Place } from '@/db/places';

export default function SelectPlace({ places }: { places: Place[] | null }) {
  const [open, setOpen] = useState(false);
  const [place, setplace] = useState('');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });

  return (
    <>
      {/* place Selector */}
      <div className="space-y-2">
        <label className="text-md font-medium">Places</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {place
                ? places?.find((loc) => loc.id === parseInt(place))?.name
                : 'Select places...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[350px] p-0" align="start">
            <Command className="w-full">
              <CommandInput placeholder="Search places..." className="w-full" />
              <CommandList className="w-full">
                <CommandEmpty>No places found.</CommandEmpty>
                <CommandGroup>
                  {places &&
                    places.map((loc) => (
                      <CommandItem
                        key={loc.id}
                        value={loc.id.toString()}
                        onSelect={(currentValue) => {
                          setplace(currentValue === place ? '' : currentValue);
                          setOpen(false);
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            'mr-2 h-4 w-4',
                            place === loc.id.toString()
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {loc.name}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
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
                  !dateRange.from && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'LLL dd, y')} -{' '}
                      {format(dateRange.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(dateRange.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Select date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange({
                    from: range?.from,
                    to: range?.to
                  });
                }}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </>
  );
}
