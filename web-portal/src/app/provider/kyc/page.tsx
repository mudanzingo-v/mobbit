"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useT } from "@/lib/i18n"
import { Upload, CheckCircle, XCircle, FileText } from "lucide-react"
import { toast } from "sonner"

const DOC_TYPES = [
  { key: "ine", labelKey: "ine" },
  { key: "rfc_constancia", labelKey: "rfc" },
  { key: "license", labelKey: "license" },
  { key: "insurance", labelKey: "insurance" },
  { key: "bank_statement", labelKey: "bankStatement" },
] as const

const KYC_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  NOT_STARTED: "secondary", SUBMITTED: "outline", APPROVED: "default", REJECTED: "destructive",
}

export default function ProviderKycPage() {
  const qc = useQueryClient()
  const { t } = useT()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedDocType, setSelectedDocType] = useState("")

  const { data: profile } = useQuery({ queryKey: ["provider-profile"], queryFn: () => api.getMyProfile() })

  const uploadMut = useMutation({
    mutationFn: () => {
      if (!selectedDocType || !selectedFile) throw new Error("Select doc type and file")
      return api.uploadKycDocument(selectedDocType, selectedFile)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["provider-profile"] }); toast.success(t.common.save); setSelectedFile(null); setSelectedDocType("") },
    onError: (e: any) => toast.error(t.common.error, e?.message || "Upload failed"),
  })

  const kycStatus = profile?.kyc_status || "NOT_STARTED"

  function getDocLabel(doc: typeof DOC_TYPES[number]): string {
    const labels: Record<string, string> = {
      ine: t.kyc.ine, rfc: t.kyc.rfc, license: t.kyc.license,
      insurance: t.kyc.insurance, bankStatement: t.kyc.bankStatement,
    }
    return labels[doc.labelKey] || doc.key
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t.kyc.title}</h1>
        <Badge variant={KYC_BADGE[kycStatus] || "secondary"}>
          {kycStatus === "NOT_STARTED" && t.kyc.notStarted}
          {kycStatus === "SUBMITTED" && t.kyc.submitted}
          {kycStatus === "APPROVED" && t.kyc.approved}
          {kycStatus === "REJECTED" && t.kyc.rejected}
        </Badge>
      </div>

      {kycStatus === "APPROVED" && <Card className="border-green-200 bg-green-50"><CardContent className="flex items-center gap-3 py-4"><CheckCircle className="h-6 w-6 text-green-600" /><p className="text-sm text-green-800">{t.kyc.approvedDesc}</p></CardContent></Card>}
      {kycStatus === "REJECTED" && <Card className="border-red-200 bg-red-50"><CardContent className="flex items-center gap-3 py-4"><XCircle className="h-6 w-6 text-red-600" /><p className="text-sm text-red-800">{t.kyc.rejectedDesc}</p></CardContent></Card>}

      {(kycStatus === "NOT_STARTED" || kycStatus === "SUBMITTED" || kycStatus === "REJECTED") && (
        <>
          <Card>
            <CardHeader><CardTitle className="text-base">{t.kyc.requiredDocs}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t.kyc.docType}</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={selectedDocType} onChange={(e) => setSelectedDocType(e.target.value)}>
                  <option value="">{t.common.search}</option>
                  {DOC_TYPES.map((dt) => (<option key={dt.key} value={dt.key}>{getDocLabel(dt)}</option>))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>{t.kyc.file}</Label>
                <Input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                {selectedFile && <p className="text-xs text-muted-foreground">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>}
              </div>
              <Button className="w-full" onClick={() => uploadMut.mutate()} disabled={!selectedDocType || !selectedFile || uploadMut.isPending}>
                <Upload className="h-4 w-4 mr-2" />{uploadMut.isPending ? t.common.loading : t.kyc.upload}
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">{t.kyc.docsToSubmit}</CardTitle></CardHeader>
            <CardContent><ul className="space-y-2 text-sm">{DOC_TYPES.map((dt) => (<li key={dt.key} className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{getDocLabel(dt)}</li>))}</ul></CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
