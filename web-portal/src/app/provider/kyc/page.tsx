"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, CheckCircle, XCircle, FileText } from "lucide-react"
import { toast } from "sonner"

const DOC_TYPES = [
  { key: "ine", label: "INE / Identificación" },
  { key: "rfc_constancia", label: "Constancia RFC" },
  { key: "license", label: "Licencia de conducir" },
  { key: "insurance", label: "Seguro de carga" },
  { key: "bank_statement", label: "Estado de cuenta bancario" },
] as const

const KYC_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  NOT_STARTED: "secondary",
  SUBMITTED: "outline",
  APPROVED: "default",
  REJECTED: "destructive",
}

export default function ProviderKycPage() {
  const qc = useQueryClient()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedDocType, setSelectedDocType] = useState<string>("")

  const { data: profile } = useQuery({
    queryKey: ["provider-profile"],
    queryFn: () => api.getMyProfile(),
  })

  const uploadMut = useMutation({
    mutationFn: () => {
      if (!selectedDocType || !selectedFile) throw new Error("Seleccioná un tipo de documento y un archivo")
      return api.uploadKycDocument(selectedDocType, selectedFile)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provider-profile"] })
      toast.success("Documento subido correctamente")
      setSelectedFile(null)
      setSelectedDocType("")
    },
    onError: (e: any) => toast.error("Error", e?.message || "No se pudo subir el documento"),
  })

  const kycStatus = profile?.kyc_status || "NOT_STARTED"

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Verificación KYC</h1>
        <Badge variant={KYC_BADGE[kycStatus] || "secondary"}>
          {kycStatus === "NOT_STARTED" && "Sin iniciar"}
          {kycStatus === "SUBMITTED" && "En revisión"}
          {kycStatus === "APPROVED" && "Aprobado"}
          {kycStatus === "REJECTED" && "Rechazado"}
        </Badge>
      </div>

      {kycStatus === "APPROVED" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-3 py-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <p className="text-sm text-green-800">Tu verificación fue aprobada. Ya podés recibir asignaciones.</p>
          </CardContent>
        </Card>
      )}

      {kycStatus === "REJECTED" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 py-4">
            <XCircle className="h-6 w-6 text-red-600" />
            <p className="text-sm text-red-800">Tu verificación fue rechazada. Subí los documentos correctos.</p>
          </CardContent>
        </Card>
      )}

      {(kycStatus === "NOT_STARTED" || kycStatus === "SUBMITTED" || kycStatus === "REJECTED") && (
        <>
          <Card>
            <CardHeader><CardTitle className="text-base">Documentos requeridos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de documento</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {DOC_TYPES.map((dt) => (
                    <option key={dt.key} value={dt.key}>{dt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Archivo (PDF, PNG, JPG)</Label>
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                {selectedFile && (
                  <p className="text-xs text-muted-foreground">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>
                )}
              </div>

              <Button
                className="w-full"
                onClick={() => uploadMut.mutate()}
                disabled={!selectedDocType || !selectedFile || uploadMut.isPending}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadMut.isPending ? "Subiendo..." : "Subir documento"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Documentos a presentar</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {DOC_TYPES.map((dt) => (
                  <li key={dt.key} className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {dt.label}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
