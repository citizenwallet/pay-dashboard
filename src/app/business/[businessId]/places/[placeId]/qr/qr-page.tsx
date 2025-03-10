'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { Download } from 'lucide-react';
import { QRCode } from 'react-qrcode-logo';
import QrPdfDocument from './qr-pdf';
import { Place } from '@/db/places';

//for error handling in pdf creation
const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => <p>Loading...</p>
  }
);

//for error handling in pdf downloading
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => <p>Loading...</p>
  }
);

export default function QrPage({ place }: { place: Place | null }) {
  const [qrValue, setQrValue] = useState(
    `${process.env.NEXT_PUBLIC_CHECKOUT_BASE_URL}/${place?.slug}`
  );
  const [rqimage, setqrimage] = useState('');

  //get the qr image url
  useEffect(() => {
    setTimeout(() => {
      const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
      if (canvas) {
        const base64Image = canvas.toDataURL('image/png');
        setqrimage(base64Image);
      }
    }, 100);
  }, [qrValue]);

  return (
    <>
      {/* download the pdf  */}
      <PDFDownloadLink
        document={<QrPdfDocument image={rqimage} />}
        fileName="qrcode.pdf"
      >
        <Button className="mt-2 flex items-center">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </PDFDownloadLink>

      {/* qr code */}
      <div className="hidden">
        <QRCode
          id="qr-canvas"
          value={qrValue}
          size={1000}
          fgColor="#0000FF"
          bgColor="#FFFFFF"
          logoImage={place?.image ?? '/assets/img/logo.svg'}
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

      {/* pdf viewer */}
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
