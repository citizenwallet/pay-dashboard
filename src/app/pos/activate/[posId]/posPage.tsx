'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Place } from '@/db/places';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { createPosAction, getPosByPlaceIdAction } from './action';

export default function PosPage({
  posId,
  places
}: {
  posId: string;
  places: Place[] | null;
}) {
  const [name, setName] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<string>(
    places?.[0]?.id.toString() ?? ''
  );
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const selectedLabel = places?.find((p) => p.id.toString() === selectedPlace)
    ?.name;

  const submitForm = async () => {
    try {
      const { data } = await getPosByPlaceIdAction(Number(selectedPlace));
      if (!data) {
        toast.error('Place not found');
        return;
      }
      const res = await createPosAction(Number(selectedPlace), name, posId);
      toast.success('Successfully Active Point of Sales App');
      router.push(
        `/business/${data.business_id}/places/${selectedPlace}/pos`
      );
    } catch (error) {
      console.error('Failed to update place display:', error);
      toast.error('Failed to Active Point of Sales App');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle>Activate Your Point of Sales App</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="place">Assign to a place</Label>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  id="place"
                >
                  {selectedLabel || 'Select a place'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Search places..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No place found.</CommandEmpty>
                    <CommandGroup>
                      {places?.map((place) => (
                        <CommandItem
                          key={place.id}
                          value={place.name.toLowerCase()}
                          onSelect={() => {
                            setSelectedPlace(place.id.toString());
                            setOpen(false);
                          }}
                        >
                          {place.name}
                          <Check
                            className={cn(
                              'ml-auto h-4 w-4',
                              selectedPlace === place.id.toString()
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <p className="text-sm text-muted-foreground">
              This will assign all orders generated by your app to this place.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            disabled={!name.trim()}
            onClick={submitForm}
          >
            Activate POS
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
