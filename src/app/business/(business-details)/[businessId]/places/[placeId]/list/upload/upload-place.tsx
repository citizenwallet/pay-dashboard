'use client';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import React from 'react';
import { downloadCsvTemplateAction } from './action';

export default function UploadPlace() {
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

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={downloadCsvTemplate}>
          <Download size={16} />
          Download CSV Template
        </Button>
        <Button>
          <Upload size={16} />
          Import places CSV
        </Button>
      </div>
    </div>
  );
}
