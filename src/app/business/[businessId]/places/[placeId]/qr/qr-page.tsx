'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { QRCode } from 'react-qrcode-logo';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import QrPdfDocument from './qr-pdf';
import { Place } from '@/db/places';

export default function QrPage({ place }: { place: Place | null }) {
  const [qrValue, setQrValue] = useState(
    `${process.env.NEXT_PUBLIC_CHECKOUT_BASE_URL}/${place?.slug}`
  );
  const [qrImage, setQrImage] = useState('');

  //get the qr image url
  useEffect(() => {
    setTimeout(() => {
      const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
      if (canvas) {
        const base64Image = canvas.toDataURL('image/png');
        setQrImage(base64Image);
      }
    }, 100);
  }, [qrValue]);

  return (
    <>
      {/* download the pdf  */}
      <PDFDownloadLink
        document={<QrPdfDocument image={qrImage} />}
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

      {/* pdf viewer */}
      <Card>
        <CardContent className="pt-6">
          <div className="h-[500px] overflow-hidden rounded-md border">
            <PDFViewer width="100%" height="100%" className="h-full w-full">
              <QrPdfDocument image={qrImage} />
            </PDFViewer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
