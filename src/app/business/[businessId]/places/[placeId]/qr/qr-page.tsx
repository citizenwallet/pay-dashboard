'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { Download } from 'lucide-react';
import { QRCode } from 'react-qrcode-logo';
import QrPdfDocument from './qr-pdf';

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
  const [rqimage, setqrimage] = useState('');

  const qrRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      const canvas = document.getElementById('qr-canvas');
      if (canvas) {
        const base64Image = canvas.toDataURL('image/png');
        setqrimage(base64Image);
      }
    }, 100);
  }, [qrValue]);

  return (
    <>
      <Button className="flex items-center gap-2">
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
      <div className="hidden">
        <QRCode
          id="qr-canvas"
          value={qrValue}
          size={1000}
          fgColor="#0000FF"
          bgColor="#FFFFFF"
          logoImage="/assets/img/logo.svg"
          logoHeight={250}
          logoWidth={250}
          logoOpacity={1}
          enableCORS={true}
          qrStyle="dots"
          removeQrCodeBehindLogo={false}
          ecLevel="H"
          eyeRadius={{
            outer: 80,
            inner: 80
          }}
          eyeColor={{
            outer: '#0000FF',
            inner: 'black'
          }}
        />
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="h-[500px] overflow-hidden rounded-md border">
            <PDFViewer width="100%" height="100%" className="h-full w-full">
              <QrPdfDocument image={rqimage} />
            </PDFViewer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
