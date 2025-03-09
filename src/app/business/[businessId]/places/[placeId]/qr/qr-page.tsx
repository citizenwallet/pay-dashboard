'use client';

import { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { QrPdfDocument } from './qr-pdf';
import { Download } from 'lucide-react';

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => <p>Loading...</p>
  }
);

export default function QrPage() {
  const [businessName, setBusinessName] = useState('Local Business');
  const [qrValue, setQrValue] = useState('https://pay.brussels/example');

  return (
    <>
      <Button className="flex items-center gap-2">
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>

      <Card>
        <CardContent className="pt-6">
          <div className="h-[500px] overflow-hidden rounded-md border">
            <PDFViewer width="100%" height="100%" className="h-full w-full">
              <QrPdfDocument />
            </PDFViewer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
