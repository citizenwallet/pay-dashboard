import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Label } from '@/components/ui/label';

export default function CompanyDetailsPage() {
  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center bg-white">
        <div className="mx-auto w-full max-w-md space-y-8 px-4">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4338ca]">
              <Image
                src="/assets/img/logo.svg"
                alt="Logo"
                width={64}
                height={64}
              />
            </div>

            <h1 className="text-left text-2xl font-semibold text-gray-900">
              Need more infos to complete the account creation
            </h1>
          </div>

          <div className="mt-8 space-y-6">
            <div className="space-y-0">
              <Label className="text-sm font-medium text-gray-900">
                Legal name
              </Label>
              <Input
                type="text"
                className="h-8 rounded-md border border-black px-4 text-black"
              />
            </div>

            <div className="space-y-0">
              <Label className="text-sm font-medium text-gray-900">
                Address
              </Label>
              <Input
                type="text"
                className="h-8 rounded-md border border-black px-4 text-black"
              />
            </div>

            <div className="space-y-0">
              <Label className="text-sm font-medium text-gray-900">IBAN</Label>
              <Input
                type="text"
                className="h-8 rounded-md border border-black px-4 text-black"
              />
            </div>

            <div className="flex justify-between">
              <Button className="h-10 w-24 rounded-md border border-black bg-gray-100 text-sm font-medium text-gray-900 hover:bg-gray-200">
                Previous
              </Button>

              <Button className="h-10 w-24 rounded-md bg-gray-100 text-sm font-medium text-gray-900 hover:bg-gray-200">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
