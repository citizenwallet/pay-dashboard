'use client';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { PaginationState, Row } from '@tanstack/react-table';
import { ArrowRight, Download, Loader, Search, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import {
  createPlaceWithoutSlugAction,
  downloadCsvTemplateAction
} from './action';

interface CsvPlace {
  id: number;
  name: string;
  description: string;
  uploaded: boolean;
}

export default function UploadPlace({ placeId }: { placeId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<CsvPlace[]>([]);
  const [uploadCsv, setUploadCsv] = useState<boolean>(false);
  const [paginatedData, setPaginatedData] = useState<CsvPlace[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<
    'name' | 'description' | null
  >(null);
  const [editingName, setEditingName] = useState<string>('');
  const [editingDescription, setEditingDescription] = useState<string>('');

  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [uploading, setUploading] = useState<boolean>(false);
  const [shouldContinueUpload, setShouldContinueUpload] =
    useState<boolean>(true);

  //search for places and handle pagination
  useEffect(() => {
    const filteredData = data.filter((place) =>
      place.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
    const paginatedResult = filteredData.slice(
      pageIndex * pageSize,
      (pageIndex + 1) * pageSize
    );
    setPaginatedData(paginatedResult);
  }, [data, debouncedSearch, pageIndex, pageSize]);

  const downloadCsvTemplate = async () => {
    const csvData = await downloadCsvTemplateAction();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'places_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    const file = event.target.files?.[0];
    if (!file) return;

    //check if the file is a csv file
    if (file.type !== 'text/csv') {
      toast.error('Please upload a valid CSV file');
      setIsLoading(false);
      return;
    }

    //check if the file is empty
    if (file.size === 0) {
      toast.error('Please upload a valid CSV file');
      setIsLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const header = lines[0].split(',');

      //check if the header is correct
      if (header[0] !== 'Name' || header[1] !== 'Description') {
        toast.error(
          'Your csv file must have a header with the following columns: Name, Description'
        );
        setIsLoading(false);
        return;
      }

      //check if the file has more than 1000 lines
      if (lines.length > 1000) {
        toast.error('Your csv file must have less than 1000 lines');
        setIsLoading(false);
        return;
      }

      //check description max length
      if (lines.some((line) => line.split(',')[1].length > 500)) {
        toast.error('Your description must be less than 500 characters');
        setIsLoading(false);
        return;
      }

      //check  name max length
      if (lines.some((line) => line.split(',')[0].length > 100)) {
        toast.error('Your name must be less than 100 characters');
        setIsLoading(false);
        return;
      }

      setUploadCsv(true);
      //skip the first line
      const data = lines.slice(1).map((line, index) => ({
        name: line.split(',')[0],
        description: line.split(',')[1],
        uploaded: false,
        id: index
      }));

      setData(data);
      // only show uploaded false places
      setPaginatedData(data.filter((place) => !place.uploaded));
    };
    reader.readAsText(file);
    setIsLoading(false);
    fileInputRef.current!.value = '';
  };

  //for name editing
  const handleNameClick = (place: CsvPlace) => {
    setEditingItemId(place.id);
    setEditingField('name');
    setEditingName(place.name || '');
  };
  const handleNameKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    place: CsvPlace
  ) => {
    if (e.key === 'Enter') {
      handleNameSave(place);
    } else if (e.key === 'Escape') {
      setEditingItemId(null);
      setEditingField(null);
    }
  };
  const handleNameSave = async (place: CsvPlace) => {
    if (editingName === place.name) {
      setEditingItemId(null);
      setEditingField(null);
      return;
    }

    setData(
      data.map((p) => (p.id === place.id ? { ...p, name: editingName } : p))
    );
    setPaginatedData(
      paginatedData.map((p) =>
        p.id === place.id ? { ...p, name: editingName } : p
      )
    );
    setEditingItemId(null);
    setEditingField(null);
    setEditingName('');
    // Save logic would go here
  };
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  };

  //for description editing
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingDescription(e.target.value);
  };
  const handleDescriptionKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    place: CsvPlace
  ) => {
    if (e.key === 'Enter') {
      handleDescriptionSave(place);
    } else if (e.key === 'Escape') {
      setEditingItemId(null);
      setEditingField(null);
    }
  };
  const handleDescriptionSave = async (place: CsvPlace) => {
    if (editingDescription === place.description) {
      setEditingItemId(null);
      setEditingField(null);
      return;
    }
    setData(
      data.map((p) =>
        p.id === place.id ? { ...p, description: editingDescription } : p
      )
    );
    setPaginatedData(
      paginatedData.map((p) =>
        p.id === place.id ? { ...p, description: editingDescription } : p
      )
    );
    setEditingItemId(null);
    setEditingField(null);
    setEditingDescription('');
  };
  const handleDescriptionClick = (place: CsvPlace) => {
    setEditingItemId(place.id);
    setEditingField('description');
    setEditingDescription(place.description || '');
  };

  const handlePaginationChange = (
    updater: PaginationState | ((old: PaginationState) => PaginationState)
  ) => {
    const newState =
      typeof updater === 'function'
        ? updater({ pageIndex, pageSize })
        : updater;
    setPageIndex(newState.pageIndex);
    setPageSize(newState.pageSize);
    setPaginatedData(
      data
        .filter((place) => !place.uploaded)
        .slice(
          newState.pageIndex * newState.pageSize,
          (newState.pageIndex + 1) * newState.pageSize
        )
    );
  };

  const columns = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: ({ row }: { row: Row<CsvPlace> }) => {
        return (
          <div className="p-2">
            {editingItemId === row.original.id && editingField === 'name' ? (
              <input
                type="text"
                value={editingName}
                onChange={handleNameChange}
                onKeyDown={(e) => handleNameKeyDown(e, row.original)}
                onBlur={() => handleNameSave(row.original)}
                autoFocus
                data-item-id={row.original.id}
                className="w-full rounded border border-gray-300 p-1"
                placeholder="Enter name"
              />
            ) : (
              <div
                onClick={() => handleNameClick(row.original)}
                className="cursor-pointer rounded p-1 hover:bg-gray-100"
              >
                {row.original.name}
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: ({ row }: { row: Row<CsvPlace> }) => {
        return (
          <div className="p-2">
            {editingItemId === row.original.id &&
            editingField === 'description' ? (
              <input
                type="text"
                value={editingDescription}
                onChange={handleDescriptionChange}
                onKeyDown={(e) => handleDescriptionKeyDown(e, row.original)}
                onBlur={() => handleDescriptionSave(row.original)}
                autoFocus
                data-item-id={row.original.id}
                className="w-full rounded border border-gray-300 p-1"
                placeholder="Enter description"
              />
            ) : (
              <div
                onClick={() => handleDescriptionClick(row.original)}
                className="cursor-pointer rounded p-1 hover:bg-gray-100"
              >
                {row.original.description}
              </div>
            )}
          </div>
        );
      }
    }
  ];

  //cancel upload
  const cancelUpload = () => {
    toast.custom((t) => (
      <div>
        <h3>Are you sure you want to cancel?</h3>
        <p>
          All your work on this page will be lost. Existing data is not changed.
        </p>
        <div className="mt-4 flex justify-end gap-3">
          <Button
            onClick={() => {
              toast.dismiss(t);
            }}
          >
            Cancel
          </Button>

          <Button
            className="ml-4 bg-red-600 text-white hover:bg-red-700"
            onClick={() => {
              toast.dismiss(t);
              setUploadCsv(false);
              setData([]);
              setPaginatedData([]);
            }}
          >
            Confirm
          </Button>
        </div>
      </div>
    ));
  };

  //confirm upload
  const confirmUpload = () => {
    toast.custom((t) => (
      <div>
        <h3>Are you sure you want to confirm?</h3>
        <p>This will upload {data.length} places to your business.</p>
        <div className="mt-4 flex justify-end gap-3">
          <Button
            onClick={() => {
              toast.dismiss(t);
            }}
          >
            Cancel
          </Button>

          <Button
            className="ml-4 bg-red-600 text-white hover:bg-red-700"
            onClick={() => {
              toast.dismiss(t);
              setUploading(true);
              uploadData();
            }}
          >
            Confirm
          </Button>
        </div>
      </div>
    ));
  };

  const uploadData = async () => {
    try {
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      for (const place of data) {
        if (!shouldContinueUpload) break;

        await delay(1000);
        try {
          const result = await createPlaceWithoutSlugAction(
            place.name,
            place.description,
            Number(placeId)
          );

          if (result && 'error' in result) {
            console.error('Error creating place:', result.message);

            await new Promise<void>((resolve) => {
              toast.custom((t) => (
                <div>
                  <h3>
                    Do you want to continue uploading the remaining places?
                  </h3>
                  <p>
                    An unexpected error occurred while uploading {place.name}
                  </p>
                  <div className="mt-4 flex justify-end gap-3">
                    <Button
                      onClick={() => {
                        setShouldContinueUpload(false);
                        toast.dismiss(t);
                        resolve();
                      }}
                    >
                      No
                    </Button>

                    <Button
                      className="ml-4 bg-red-600 text-white hover:bg-red-700"
                      onClick={() => {
                        toast.dismiss(t);
                        resolve();
                      }}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              ));
            });

            if (!shouldContinueUpload) break;
          }
        } catch (error) {
          console.error('Unexpected error:', error);

          await new Promise<void>((resolve) => {
            toast.custom((t) => (
              <div>
                <h3>Do you want to continue uploading the remaining places?</h3>
                <p>An unexpected error occurred while uploading {place.name}</p>
                <div className="mt-4 flex justify-end gap-3">
                  <Button
                    onClick={() => {
                      setShouldContinueUpload(false);
                      toast.dismiss(t);
                      resolve();
                    }}
                  >
                    No
                  </Button>

                  <Button
                    className="ml-4 bg-red-600 text-white hover:bg-red-700"
                    onClick={() => {
                      toast.dismiss(t);
                      resolve();
                    }}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            ));
          });
          if (!shouldContinueUpload) break;
        }

        const updatedData = data.map((p) =>
          p.id === place.id ? { ...p, uploaded: true } : p
        );
        setData((prevData) => prevData.filter((p) => p.id !== place.id));
        setPaginatedData((prevData) =>
          prevData.filter((p) => p.id !== place.id)
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      toast.success('Places uploaded successfully');
      setUploadCsv(false);
      setData([]);
      setPaginatedData([]);
      router.back();
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* for csv file upload */}
      <Input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
        ref={fileInputRef}
      />

      {!uploadCsv && (
        <div className="flex flex-col gap-2">
          <p className="mb-2 text-gray-600">
            Download the CSV template and upload your places.
          </p>
          <Button
            variant="outline"
            onClick={downloadCsvTemplate}
            className="flex w-[300px] items-center gap-2"
          >
            <Download size={16} />
            Download CSV Template
          </Button>

          <p className="mb-2 mt-6 text-gray-600">
            Upload your places as CSV file.
          </p>

          <Button
            onClick={() => fileInputRef.current?.click()}
            className="flex w-[300px] items-center gap-2"
          >
            <Upload size={16} />
            Import Places CSV
          </Button>

          {isLoading && (
            <div className="flex h-[50px] w-[50px] items-center justify-center rounded-md">
              <Loader className="animate-spin text-gray-500" size={24} />
            </div>
          )}
        </div>
      )}

      <div className="w-[95vw] overflow-y-auto md:w-full">
        {uploadCsv && (
          <>
            <div className="flex w-full justify-end">
              <div className="relative my-4 w-[300]">
                <Input
                  className="peer w-full pl-9 pr-9"
                  placeholder="Search for anything..."
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 text-muted-foreground/80 peer-disabled:opacity-50">
                  <Search
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                    role="presentation"
                  />
                </div>
                <button
                  className="absolute inset-y-px right-px flex h-full w-9 items-center justify-center rounded-r-lg text-muted-foreground/80 ring-offset-background transition-shadow hover:text-foreground focus-visible:border focus-visible:border-ring focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Submit search"
                  type="submit"
                >
                  <ArrowRight
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                    role="presentation"
                  />
                </button>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={paginatedData}
              pageCount={Math.ceil(data.length / pageSize)}
              pageSize={pageSize}
              pageIndex={pageIndex}
              onPaginationChange={handlePaginationChange}
            />

            <div className="mb-6 mt-4 flex justify-start gap-2">
              <Button
                variant="outline"
                onClick={cancelUpload}
                className="w-[150]"
                disabled={uploading}
              >
                Cancel
              </Button>

              <Button
                className="w-[150]"
                variant="default"
                onClick={confirmUpload}
                disabled={uploading}
              >
                Confirm
              </Button>

              {uploading && (
                <div className="flex h-[50px] w-[50px] items-center justify-center rounded-md">
                  <Loader className="animate-spin text-gray-500" size={24} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
