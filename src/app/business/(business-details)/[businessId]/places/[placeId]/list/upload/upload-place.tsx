'use client';
import { Button } from '@/components/ui/button';
import { Download, Loader, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { downloadCsvTemplateAction } from './action';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { DataTable } from '@/components/ui/data-table';
import { Row } from '@tanstack/react-table';

interface CsvPlace {
  id: number;
  name: string;
  description: string;
  uploaded: boolean;
}

export default function UploadPlace() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<CsvPlace[]>([]);
  const [uploadCsv, setUploadCsv] = useState<boolean>(false);

  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<
    'name' | 'description' | null
  >(null);
  const [editingName, setEditingName] = useState<string>('');
  const [editingDescription, setEditingDescription] = useState<string>('');

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
    };
    reader.readAsText(file);
    setIsLoading(false);
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
  };
  const handleDescriptionClick = (place: CsvPlace) => {
    setEditingItemId(place.id);
    setEditingField('description');
    setEditingDescription(place.description || '');
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

      <div className="w-[95vw] overflow-x-auto md:w-full">
        {uploadCsv && (
          <DataTable
            columns={columns}
            data={data}
            pageCount={2}
            pageSize={25}
            pageIndex={0}
            onPaginationChange={() => {}}
          />
        )}
      </div>
    </div>
  );
}
