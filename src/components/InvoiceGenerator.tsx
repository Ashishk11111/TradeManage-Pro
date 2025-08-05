
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, Search, FileText } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Client, InvoiceItem, Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { PDFDocument, StandardFonts, PDFFont, PDFPage, rgb, RGB } from 'pdf-lib';
import { convertToIndianCurrencyWords } from './ui/convertToIndianCurrencyWords';
import { Company } from '@/types/index'; // ✅ relative path



const InvoiceGenerator = () => {
  function formatDateToDDMMYYYY(dateString: string): string {
    if (!dateString || dateString.trim() === '') return ''; // No input
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Invalid date check

    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const yyyy = date.getFullYear();

    return `${dd}-${mm}-${yyyy}`;
  }
  const drawWrappedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number,
    font: PDFFont,
    page: PDFPage,
    lineHeight = fontSize + 2
  ) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (const word of words) {
      const testLine = line + word + ' ';
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (textWidth > maxWidth) {
        page.drawText(line.trim(), { x, y: currentY, size: fontSize, font });
        line = word + ' ';
        currentY -= lineHeight;
      } else {
        line = testLine;
      }
    }

    if (line) {
      page.drawText(line.trim(), { x, y: currentY, size: fontSize, font });
    }
  };
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', []);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [formData, setFormData] = useState({

    invoiceNumber: '',
    Date: '',
    vehicleNo: '',
    dispatchedThrough: '',
    dispatchedDate: '',
    dispatchedDocNo: '',
    referenceNo: '',
    referenceDate: '',
    modeofTransport: '',
    DateOfTransport: '',
    customerPO: '',
    customerPODate: '',
    shipedToName: '',
    shipedToAddress: '',
    placeOfSupply: '',
    ModeTermsOfPayment: '',
    destination: ''
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    {
      description: [''],
      hsnCode: '',
      unit: '',
      quantity: 0,
      rate: 0,
      discount: 0,
      amount: 0,
    },
  ]);
  const fieldLabels = {
    invoiceNumber: 'Invoice number',
    Date: 'Dated',
    vehicleNo: 'Vehicle No. : ',
    dispatchedThrough: 'Dispatched Through ',
    dispatchedDate: 'Dispatched Date',
    dispatchedDocNo: 'Dispatch Doc No. ',
    referenceNo: 'Reference No',
    referenceDate: 'Reference Date',

    DateOfTransport: 'Date of Transport',
    customerPO: 'Customer P.O. NO.: ',
    customerPODate: 'Customer PO Date',
    shipedToName: 'Shipped To Name',
    shipedToAddress: 'Shipped To Address',
    placeOfSupply: 'Place of Supply',
    ModeTermsOfPayment: 'Mode/Terms of Payment',

    destination: 'Destination'
  };



  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clientDetails')
          .select('*')
          .order('dateAdded', { ascending: false });

        if (error) {
          console.error('Supabase error:', error.message);
          alert('Error fetching clients: ' + error.message); // 🛠️ Use alert for simplicity
          return;
        }

        setClients(data ?? []);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Unexpected error:', err.message);
          alert('Unexpected error fetching clients: ' + err.message); // 🛠️ Use alert for simplicity
        } else {
          alert('An unknown error occurred while fetching clients.'); // 🛠️ Use alert for simplicity
        }
      }
    };

    fetchClients();
  }, []); 

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchCompany = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (!userId) return;

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', userId)
        .limit(1)
        .single();

      if (error) {
        console.error('Company fetch error:', error.message);
      } else {
        setCompany(data);
      }

      setLoading(false);
    };

    fetchCompany();
  }, []);

  // ✅ After all hooks are declared

  const [clientSearch, setClientSearch] = useState('');

  const selectedClient = clients.find(client => client.id === selectedClientId);
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // console.log('Filtered Clients:', filteredClients);

  const calculateAmount = (quantity: number, rate: number) => quantity * rate;

  const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount - item.discount * item.amount / 100, 0);
  const tax = subtotal * 0.18; // 18% tax
  const total = subtotal + tax;

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = calculateAmount(
        updatedItems[index].quantity,
        updatedItems[index].rate
      );
    }

    setInvoiceItems(updatedItems);
  };

  const addItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        description: [''],
        quantity: 0,
        rate: 0,
        discount: 0,
        amount: 0,
        hsnCode: '',
        unit: '',
      },
    ]);
  };


  const removeItem = (index: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
  };

  // const loadTemplate = async (): Promise<Uint8Array> => {
  //   const templateUrl = '/template.pdf';
  //   const response = await fetch(templateUrl);
  //   const buffer = await response.arrayBuffer();
  //   return new Uint8Array(buffer);
  // };



  const formatIndianCurrency = (amount: number) => {
    return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // const numberToWords = (num: any) => {
  //   const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  //     'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  //     'Seventeen', 'Eighteen', 'Nineteen'];
  //   const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  //   const inWords = (n: number) => {
  //     if (n < 20) return a[n];
  //     if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
  //     if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + inWords(n % 100) : '');
  //     if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
  //     if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
  //     return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
  //   };

  //   return inWords(num);
  // };

  const generatePDF = async (invoice: Invoice) => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 595;
    const pageHeight = 842;
    const margin = 40;
    const lineHeight = 14;
    const maxLinesPerPage = 35;

    let currentLineCount = 0;
    let pageNumber = 1;
    let page = doc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;
    let serial = 1;
    const rgb255 = (r: number, g: number, b: number) => rgb(r / 255, g / 255, b / 255);
    const drawBox = (x: number, y: number, width: number, height: number) => {
      page.drawRectangle({
        x,
        y: y - height,
        width,
        height,
        borderColor: rgb(0, 0, 0),
        color: rgb255(204, 255, 204),
        borderWidth: 0.5
      });
    };

    const drawPageFooter = () => {
      const footerY = 30;
      page.drawText(`Page ${pageNumber}`, {
        x: pageWidth - margin - 50,
        y: footerY,
        size: 9,
        font,
        color: rgb(0.4, 0.4, 0.4)
      });
    };

    const drawTextWithBackground = (
      text: string,
      x: number,
      y: number,
      size: number,
      font: PDFFont,
      textColor: RGB,
      bgColor: RGB,
      padding = 4
    ) => {
      const textWidth = font.widthOfTextAtSize(text, size);
      const textHeight = size;

      // Draw background rectangle
      page.drawRectangle({
        x: x - padding,
        y: y - padding,
        width: textWidth + padding * 2,
        height: textHeight + padding * 2,
        color: bgColor,
      });

      // Draw text on top of it
      page.drawText(text, {
        x,
        y,
        size,
        font,
        color: textColor,
      });
    };
    const { width, height } = page.getSize();
    const centerX = width / 2;

    const drawPageHeader = () => {
      y = pageHeight - margin;

      const companyName = company?.name || 'AshTech Engineering Works';
      const companyInfo1 = company?.address || '1234, Sector 56, Gurugram, Haryana, India';
      const companyInfo2 = `GSTIN: 06ABCDE1234F1Z1 | Phone: ${company.phone} | Email: ${company.email}`;

      // Draw Company Name
      drawTextWithBackground(
        companyName,
        centerX - boldFont.widthOfTextAtSize(companyName, 28) / 2,
        y,
        28,
        boldFont,
        rgb255(0, 102, 51),
        rgb255(232, 255, 232) // light green background
      );
      y -= lineHeight * 1.8;

      // Company Info 1
      drawTextWithBackground(
        companyInfo1,
        centerX - font.widthOfTextAtSize(companyInfo1, 13) / 2,
        y,
        13,
        font,
        rgb(0, 0, 0),
        rgb255(240, 240, 240)
      );
      y -= lineHeight * 1.4;

      // Company Info 2
      drawTextWithBackground(
        companyInfo2,
        centerX - font.widthOfTextAtSize(companyInfo2, 12) / 2,
        y,
        12,
        font,
        rgb(0, 0, 0),
        rgb255(240, 240, 240)
      );

      y -= lineHeight * 2.5;

      page.drawText('TAX INVOICE', { x: margin, y, size: 20, font: boldFont, color: rgb(0.2, 0.2, 0.6) });
      y -= lineHeight;

      page.drawText(`Invoice No: 25-26/${invoice.invoiceNumber.padStart(3, '0')}`, { x: margin, y, size: 10, font });
      page.drawText(`Date: ${invoice.date}`, { x: pageWidth - 200, y, size: 10, font });
      y -= lineHeight;

      page.drawText(`Vehicle No: ${invoice.vehicleNo}`, { x: margin, y, size: 10, font });
      page.drawText(`Dispatched Through: ${invoice.dispatchedThrough}`, { x: pageWidth - 200, y, size: 10, font });
      y -= lineHeight;

      page.drawText(`Customer PO: ${invoice.customerPO}`, { x: margin, y, size: 10, font });
      page.drawText(`PO Date: ${invoice.customerPODate}`, { x: pageWidth - 200, y, size: 10, font });
      y -= lineHeight;

      page.drawText(`Mode/Terms of Payment: ${invoice.ModeTermsOfPayment}`, { x: margin, y, size: 10, font });
      page.drawText(`Date of Transport: ${invoice.DateOfTransport}`, { x: pageWidth - 200, y, size: 10, font });
      y -= lineHeight;

      page.drawText(`Reference No: ${invoice.referenceNo}`, { x: margin, y, size: 10, font });
      page.drawText(`Reference Date: ${invoice.referenceDate}`, { x: pageWidth - 200, y, size: 10, font });
      y -= lineHeight * 2;

      page.drawText('Billed To:', { x: margin, y, size: 10, font: boldFont });
      page.drawText('Shipped To:', { x: pageWidth / 2 + 20, y, size: 10, font: boldFont });
      y -= lineHeight;

      const client = invoice.client;
      page.drawText(client.name, { x: margin, y, size: 10, font });
      page.drawText(invoice.shipedToName, { x: pageWidth / 2 + 20, y, size: 10, font });
      y -= lineHeight;

      page.drawText(client.address, { x: margin, y, size: 10, font });
      page.drawText(invoice.shipedToAddress, { x: pageWidth / 2 + 20, y, size: 10, font });
      y -= lineHeight;

      page.drawText(`State: ${client.state}`, { x: margin, y, size: 10, font });
      page.drawText(`Place of Supply: ${invoice.placeOfSupply}`, { x: pageWidth / 2 + 20, y, size: 10, font });
      y -= lineHeight;

      page.drawText(`GSTIN: ${client.GSTIN}`, { x: margin, y, size: 10, font });
      page.drawText(`Destination: ${invoice.destination}`, { x: pageWidth / 2 + 20, y, size: 10, font });
      y -= lineHeight * 2;

      const tableCols = [margin, margin + 35, margin + 235, margin + 275, margin + 315, margin + 375, margin + 435, pageWidth - margin];
      const headers = ['S.No', 'Description', 'HSN', 'Qty', 'Rate', 'Disc', 'Amount'];

      headers.forEach((header, i) => {
        const colCenter = tableCols[i] + (tableCols[i + 1] - tableCols[i]) / 2;
        const textY = y + (lineHeight - 10) / 2;
        page.drawText(header, {
          x: colCenter - font.widthOfTextAtSize(header, 10) / 2,
          y: textY,
          size: 10,
          font: boldFont
        });
      });
      y -= lineHeight;
      currentLineCount = 14;
      drawPageFooter();
      pageNumber++;
    };

    drawPageHeader();

    const drawFooter = () => {
      y -= lineHeight * 2;
      page.drawText(`For ${company.name}`, { x: pageWidth - margin - 200, y, size: 10, font });
      y -= lineHeight * 3;
      page.drawText('Authorised Signatory', { x: pageWidth - margin - 200, y, size: 10, font });
    };

    const drawSummary = (subtotal: number, tax: number, total: number) => {
      const boxX = pageWidth - 200;
      let boxY = y;
      const boxWidth = 160;
      const boxHeight = lineHeight * 4;

      drawBox(boxX, boxY, boxWidth, boxHeight);
      page.drawText(`Subtotal: Rs${formatIndianCurrency(subtotal)}`, { x: boxX + 10, y: boxY - lineHeight, size: 10, font: boldFont });
      page.drawText(`Tax (18%): Rs${formatIndianCurrency(tax)}`, { x: boxX + 10, y: boxY - lineHeight * 2, size: 10, font: boldFont });
      page.drawText(`Total: Rs${formatIndianCurrency(total)}`, { x: boxX + 10, y: boxY - lineHeight * 3, size: 11, font: boldFont });

      y = boxY - lineHeight * 4;

      const amountInWords = convertToIndianCurrencyWords(Math.floor(total));
      page.drawText(`Amount in words: ${amountInWords}`, { x: margin, y, size: 10, font });
      y -= lineHeight * 2;
    };

    const drawItemRow = (item: InvoiceItem, index: number, descLine: string, isFirstLine: boolean) => {
      const tableCols = [margin, margin + 35, margin + 235, margin + 275, margin + 315, margin + 375, margin + 435, pageWidth - margin];

      // Draw row borders
      for (let i = 0; i < tableCols.length - 1; i++) {
        drawBox(tableCols[i], y + lineHeight, tableCols[i + 1] - tableCols[i], lineHeight);
      }

      const centerText = (text: string, colStart: number, colEnd: number, fontSize = 9) => {
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const x = colStart + (colEnd - colStart - textWidth) / 2;
        const textY = y + (lineHeight - fontSize) / 2;
        page.drawText(text, { x, y: textY, size: fontSize, font });
      };

      if (isFirstLine) {
        const base = item.quantity * item.rate;
        const discounted = base - (base * item.discount) / 100;

        centerText(`${index + 1}`, tableCols[0], tableCols[1]);
        centerText(descLine, tableCols[1], tableCols[2]);
        centerText(item.hsnCode, tableCols[2], tableCols[3]);
        centerText(item.quantity.toString(), tableCols[3], tableCols[4]);
        centerText(`${item.rate}`, tableCols[4], tableCols[5]);
        centerText(`${item.discount}%`, tableCols[5], tableCols[6]);
        centerText(`${formatIndianCurrency(discounted)}`, tableCols[6], tableCols[7]);
        return discounted;
      } else {
        centerText(descLine, tableCols[1], tableCols[2]);
        return 0;
      }
    };


    let subtotal = 0;
    invoice.items.forEach((item, itemIndex) => {
      const validDescriptions = item.description.filter(d => d.trim() !== '');
      validDescriptions.forEach((descLine, i) => {
        if (currentLineCount >= maxLinesPerPage) {
          drawPageFooter();
          page = doc.addPage([pageWidth, pageHeight]);
          drawPageHeader();
        }
        const isFirst = i === 0;
        const discounted = drawItemRow(item, itemIndex, descLine, isFirst);
        subtotal += discounted;
        y -= lineHeight;
        currentLineCount++;
      });
    });

    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    drawSummary(subtotal, tax, total);
    drawFooter();

    const pdfBytes = await doc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Invoice-${invoice.invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };






  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient) {
      alert('Please select a client');
      return;
    }

    if (invoiceItems.some(item => item.description.length === 0 || item.description.every(desc => desc.trim() === ''))) {
      alert('Please add at least one description for each item');
      return;
    }


    const newInvoice: Invoice = {
      id: Date.now().toString(),
      clientId: selectedClient.id,
      client: selectedClient,
      items: invoiceItems,
      subtotal,
      tax,
      total,
      date: new Date().toISOString().split('T')[0],

      // ✅ Merge formData values here
      invoiceNumber: formData.invoiceNumber,
      vehicleNo: formData.vehicleNo,
      dispatchedThrough: formData.dispatchedThrough,
      dispatchedDate: formData.dispatchedDate,
      dispatchedDocNo: formData.dispatchedDocNo,
      referenceNo: formData.referenceNo,
      referenceDate: formData.referenceDate,
      DateOfTransport: formData.DateOfTransport,
      customerPO: formData.customerPO,
      customerPODate: formData.customerPODate,

      modeofTransport: formData.modeofTransport,
      shipedToName: formData.shipedToName,
      shipedToAddress: formData.shipedToAddress,
      placeOfSupply: formData.placeOfSupply,
      ModeTermsOfPayment: formData.ModeTermsOfPayment,
      // termsOfDelivery: formData.termsOfDelivery,
      destination: formData.destination
    };




    setInvoices([...invoices, newInvoice]);

    alert('Invoice created successfully!');





    // Generate PDF
    await generatePDF(newInvoice);

    // Reset form
    setSelectedClientId('');
    setClientSearch('');
    setInvoiceItems([{
      description: [''],
      quantity: 0,
      rate: 0,
      discount: 0,
      amount: 0,
      hsnCode: '',
      unit: ''
    }]);
  };

  const handleDescriptionChange = (itemIndex: number, descIndex: number, value: string) => {
    setInvoiceItems((prev) => {
      const updated = [...prev];
      updated[itemIndex].description[descIndex] = value;
      return updated;
    });
  };

  const addDescription = (itemIndex: number) => {
    setInvoiceItems((prev) => {
      const updated = [...prev];
      updated[itemIndex].description.push('');
      return updated;
    });
  };

  const deleteDescription = (itemIndex: number, descIndex: number) => {
    setInvoiceItems((prev) => {
      const updated = [...prev];
      updated[itemIndex].description.splice(descIndex, 1);
      return updated;
    });
  };


  if (!company && loading) {
    return <p className="text-center mt-10">Loading company details...</p>;
  }

  if (!company) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500">
          No company details found. Please set up your company profile.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-6 px-4 md:px-6 py-6 max-w-screen-xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invoice Generator</h1>
        <p className="text-gray-600 mt-2">Create professional invoices for your clients</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:gap-10">
        {/* Invoice Form */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Create New Invoice</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Client Selection */}
                <div>
                  <Label htmlFor="client-search">Select Client</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <Input
                        id="client-search"
                        placeholder="Search clients..."
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="client" className="text-sm text-gray-700">
                        Choose a client
                      </label>
                      <select
                        id="client"
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="w-full border border-gray-300 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="" disabled>
                          Choose a client
                        </option>
                        {filteredClients.length > 0 ? (
                          filteredClients.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name} - {client.email}
                            </option>
                          ))
                        ) : (
                          <option disabled>No matching clients</option>
                        )}
                      </select>
                    </div>

                  </div>

                  {selectedClient && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{selectedClient.name}</p>
                      <p className="text-sm text-gray-600">{selectedClient.email}</p>
                      <p className="text-sm text-gray-600">{selectedClient.phoneNo}</p>
                      <p className="text-sm text-gray-600">{selectedClient.address}</p>
                    </div>
                  )}
                </div>

                {/* Dispatch & Shipping Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key}>
                      <Label>{fieldLabels[key]}</Label>
                      <Input
                        type={key.includes('Date') ? 'date' : 'text'}
                        // placeholder={fieldLabels[key]}
                        value={value}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                      />
                    </div>
                  ))}

                </div>

                {/* Invoice Items */}
                <div>
                  <Label className="mb-4 block">Invoice Items</Label>
                  <div className="space-y-6">
                    {invoiceItems.map((item, index) => (
                      <div key={index} className="border p-4 rounded-lg shadow-sm space-y-4">
                        {/* Description Full Width */}
                        <div>
                          {item.description.map((desc, descIndex) => (
                            <div key={descIndex} className="flex flex-col gap-1 mb-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder={`Description ${descIndex + 1}`}
                                  value={desc}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value.length <= 39) {
                                      handleDescriptionChange(index, descIndex, value);
                                    }
                                  }}
                                  className="w-full"
                                />
                                <button
                                  type="button"
                                  onClick={() => deleteDescription(index, descIndex)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ✕
                                </button>
                              </div>
                              {desc.length >= 39 && (
                                <span className="text-xs text-yellow-600 ml-1">
                                  ⚠️ You’ve reached the maximum characters limit.
                                </span>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addDescription(index)}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            + Add Description
                          </button>
                        </div>

                        {/* Other Fields Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-7 gap-4 items-end">
                          <Input
                            placeholder="HSN Code"
                            value={item.hsnCode}
                            maxLength={8} // HTML-level restriction
                            onChange={(e) => {
                              // Even if pasted text is longer, this will cap it
                              const trimmed = e.target.value.slice(0, 8);
                              handleItemChange(index, 'hsnCode', trimmed);
                            }}
                          />

                          <Input
                            placeholder="Unit"
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Rate"
                            value={item.rate === 0 ? '' : item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value))}
                          />

                          <Input
                            type="text" // 👈 use text to fully control input
                            inputMode="decimal" // 👈 shows numeric keyboard on mobile
                            placeholder="Qty"
                            value={item.quantity === 0 ? '' : item.quantity}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d*\.?\d*$/.test(value)) {  // ✅ Only digits and 1 optional decimal
                                handleItemChange(index, 'quantity', value === '' ? 0 : parseFloat(value));
                              }
                            }}
                          />
                          <Input
                            type="number"
                            placeholder="Discount %"
                            step={1}
                            value={item.discount === 0 ? '' : item.discount}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              const parsedValue = inputValue === '' ? 0 : parseFloat(inputValue);
                              handleItemChange(index, 'discount', parsedValue);
                            }}
                          />


                          <Input
                            value={`₹${item.amount.toFixed(2)}`}
                            readOnly
                            className="bg-gray-50"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                            disabled={invoiceItems.length === 1}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Add Item button */}
                    <div className="text-right">
                      <Button type="button" onClick={addItem} size="sm" variant="outline">
                        <Plus size={16} className="mr-1" />
                        Add Item
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2 text-right">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (18%):</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <Download size={20} className="mr-2" />
                  Generate Invoice & Download PDF
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Recent Invoices */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No invoices generated yet</p>
                </div>
              ) : (
                <div className="space-y-3">

                  {invoices.slice(-5).reverse().map((invoice) => (
                    <div key={invoice.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-gray-600">{invoice.client.name}</p>
                          <p className="text-sm text-gray-600">{invoice.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{invoice.total.toFixed(2)}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generatePDF(invoice)}
                            className="mt-1"
                          >
                            <Download size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

  );
};

export default InvoiceGenerator;
