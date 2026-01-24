'use client';

import { useState, useEffect } from 'react';
import { Shirt, Ruler, Check, Copy, Printer, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const tShirtSizes = [
  { size: 'XS', chest: '32-34', length: '26', sleeve: '8', fit: 'Fitted' },
  { size: 'S', chest: '34-36', length: '27', sleeve: '8.5', fit: 'Regular' },
  { size: 'M', chest: '38-40', length: '28', sleeve: '9', fit: 'Regular' },
  { size: 'L', chest: '42-44', length: '29', sleeve: '9.5', fit: 'Regular' },
  { size: 'XL', chest: '46-48', length: '30', sleeve: '10', fit: 'Relaxed' },
  { size: '2XL', chest: '50-52', length: '31', sleeve: '10.5', fit: 'Relaxed' },
  { size: '3XL', chest: '54-56', length: '32', sleeve: '11', fit: 'Relaxed' },
];

const hatSizes = [
  { size: 'S/M', cm: '54-56', inches: '21.25-22', adjustment: 'Snapback' },
  { size: 'L/XL', cm: '57-59', inches: '22.5-23.25', adjustment: 'Snapback' },
  { size: 'XXL', cm: '60-62', inches: '23.5-24.5', adjustment: 'Flex Fit' },
];

const measurementGuide = [
  { part: 'Chest', howTo: 'Measure around the fullest part of your chest, keeping the tape horizontal.' },
  { part: 'Length', howTo: 'Measure from the highest point of the shoulder to the bottom hem.' },
  { part: 'Sleeve', howTo: 'Measure from the center back neck, over the shoulder, down to the sleeve opening.' },
];

export default function ApparelSizesPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#001F3F]">Apparel Sizes</h1>
          <p className="text-gray-600 mt-1">Size charts and measurement guides for all La Pesqueria apparel</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Measurement Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[#FF4500]" />
            How to Measure
          </CardTitle>
          <CardDescription>Get accurate measurements for the best fit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {measurementGuide.map((item) => (
              <div key={item.part} className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-[#001F3F] mb-2">{item.part}</h3>
                <p className="text-sm text-gray-600">{item.howTo}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Size Charts */}
      <Tabs defaultValue="tshirts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tshirts" className="flex items-center gap-2">
            <Shirt className="w-4 h-4" />
            T-Shirts
          </TabsTrigger>
          <TabsTrigger value="hats" className="flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            Hats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tshirts">
          <Card>
            <CardHeader>
              <CardTitle>T-Shirt Size Chart</CardTitle>
              <CardDescription>Measurements in inches. Find your size based on chest measurement.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Size</TableHead>
                    <TableHead>Chest</TableHead>
                    <TableHead>Length</TableHead>
                    <TableHead>Sleeve</TableHead>
                    <TableHead>Fit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tShirtSizes.map((size) => (
                    <TableRow key={size.size}>
                      <TableCell className="font-medium">{size.size}</TableCell>
                      <TableCell>{size.chest}"</TableCell>
                      <TableCell>{size.length}"</TableCell>
                      <TableCell>{size.sleeve}"</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          size.fit === 'Fitted' ? 'bg-blue-100 text-blue-700' :
                          size.fit === 'Regular' ? 'bg-green-100 text-green-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {size.fit}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(
                            `Size ${size.size}: Chest ${size.chest}", Length ${size.length}", Sleeve ${size.sleeve}"`,
                            size.size
                          )}
                        >
                          {copied === size.size ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hats">
          <Card>
            <CardHeader>
              <CardTitle>Hat Size Chart</CardTitle>
              <CardDescription>Find your perfect hat size</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Size</TableHead>
                    <TableHead>Circumference (cm)</TableHead>
                    <TableHead>Circumference (inches)</TableHead>
                    <TableHead>Adjustment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hatSizes.map((size) => (
                    <TableRow key={size.size}>
                      <TableCell className="font-medium">{size.size}</TableCell>
                      <TableCell>{size.cm} cm</TableCell>
                      <TableCell>{size.inches}"</TableCell>
                      <TableCell>{size.adjustment}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(
                            `Hat Size ${size.size}: ${size.cm} cm (${size.inches}")`,
                            `hat-${size.size}`
                          )}
                        >
                          {copied === `hat-${size.size}` ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Reference Card */}
      <Card className="bg-[#001F3F] text-white">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#FF4500] rounded-lg">
              <Shirt className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Sizing Tips</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li>• For a relaxed fit, go up one size from your chest measurement</li>
                <li>• All measurements are approximate and may vary slightly</li>
                <li>• If you're between sizes, we recommend choosing the larger size</li>
                <li>• Contact us for custom sizing options for teams or groups</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
