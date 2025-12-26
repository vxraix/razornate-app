"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Upload, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

interface PaymentInstructionsProps {
  appointmentId: string;
  amount: number;
  paymentReference: string;
  onProofUploaded?: () => void;
}

export function PaymentInstructions({
  appointmentId,
  amount,
  paymentReference,
  onProofUploaded,
}: PaymentInstructionsProps) {
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchBankDetails();
    fetchPaymentStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBankDetails = async () => {
    try {
      const response = await fetch("/api/settings/bank");
      const data = await response.json();
      if (response.ok) {
        setBankDetails(data);
      }
    } catch (error) {
      console.error("Error fetching bank details:", error);
    }
  };

  const fetchPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payments/${appointmentId}`);
      const data = await response.json();
      if (response.ok && data.proofUrl) {
        setProofUrl(data.proofUrl);
      }
    } catch (error) {
      console.error("Error fetching payment status:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type. Only JPEG, PNG, and PDF are allowed.");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size too large. Maximum 5MB allowed.");
        return;
      }

      setProofFile(file);
    }
  };

  const handleUpload = async () => {
    if (!proofFile) {
      toast.error("Please select a file");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", proofFile);
      formData.append("appointmentId", appointmentId);

      const uploadResponse = await fetch("/api/payments/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || "Upload failed");
      }

      // Update payment with proof URL
      const updateResponse = await fetch(`/api/payments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofUrl: uploadData.url }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update payment");
      }

      setProofUrl(uploadData.url);
      toast.success("Payment proof uploaded successfully!");
      onProofUploaded?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload proof");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border-gold-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-gold-500" />
          Payment Instructions
        </CardTitle>
        <CardDescription>
          Complete your payment via bank transfer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bank Details */}
        <div className="space-y-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
          <h3 className="font-semibold text-gold-500">Bank Transfer Details</h3>
          {bankDetails.bankName && (
            <div>
              <label className="text-sm text-gray-400">Bank Name</label>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-white font-medium">{bankDetails.bankName}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(bankDetails.bankName)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
          {bankDetails.accountNumber && (
            <div>
              <label className="text-sm text-gray-400">Account Number</label>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-white font-medium font-mono">
                  {bankDetails.accountNumber}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(bankDetails.accountNumber)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
          {bankDetails.accountHolder && (
            <div>
              <label className="text-sm text-gray-400">Account Holder</label>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-white font-medium">
                  {bankDetails.accountHolder}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(bankDetails.accountHolder)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
          <div>
            <label className="text-sm text-gray-400">Payment Reference</label>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-white font-medium font-mono text-sm">
                {paymentReference}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(paymentReference)}
                className="h-6 w-6 p-0"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Include this reference when making the transfer
            </p>
          </div>
          <div className="pt-2 border-t border-gray-800">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Amount to Pay</span>
              <span className="text-gold-500 font-bold text-lg">
                ${amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Upload Proof */}
        <div className="space-y-4">
          <h3 className="font-semibold">Upload Payment Proof</h3>
          {proofUrl ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Proof uploaded successfully</span>
              </div>
              <div className="relative w-full h-48 bg-gray-900 rounded-lg overflow-hidden">
                {proofUrl.endsWith(".pdf") ? (
                  <iframe
                    src={proofUrl}
                    className="w-full h-full"
                    title="Payment proof"
                  />
                ) : (
                  <Image
                    src={proofUrl}
                    alt="Payment proof"
                    fill
                    className="object-contain"
                  />
                )}
              </div>
              <p className="text-xs text-gray-400">
                Your payment is pending verification. We&apos;ll notify you once
                it&apos;s confirmed.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400 mb-2">
                  Upload a screenshot or PDF of your bank transfer
                </p>
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="max-w-xs mx-auto"
                />
                {proofFile && (
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {proofFile.name}
                  </p>
                )}
              </div>
              <Button
                onClick={handleUpload}
                disabled={!proofFile || isUploading}
                className="w-full"
              >
                {isUploading ? "Uploading..." : "Upload Proof"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
