"use client";
/**
 * Dialog d'import de contacts depuis un fichier Excel (.xls, .xlsx).
 * Zone de drag-and-drop, sélection de campagne, appel API avec feedback en temps réel.
 * S'ouvre au centre de la page avec animation.
 */
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";

import { FormDialog } from "@/components/ui/form-dialog";
import { Button } from "@/components/ui/button";

type CampaignOption = Readonly<{ id: string; title: string }>;

type ImportResult = Readonly<{
  ok: boolean;
  imported: number;
  skipped: number;
  errors: readonly string[];
  message: string;
}>;

type ImportExcelDialogProps = Readonly<{
  campaigns: readonly CampaignOption[];
}>;

export const ImportExcelDialog = ({
  campaigns,
}: ImportExcelDialogProps): React.JSX.Element => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [campaignId, setCampaignId] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isValidFile = useCallback(({ f }: Readonly<{ f: File }>): boolean => {
    const ext: string = f.name.toLowerCase().split(".").pop() ?? "";
    const acceptedTypes: readonly string[] = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    return ext === "xls" || ext === "xlsx" || acceptedTypes.includes(f.type);
  }, []);
  const handleFileSelect = useCallback((selectedFile: File): void => {
    if (!isValidFile({ f: selectedFile })) {
      setError("Format invalide. Seuls les fichiers .xls et .xlsx sont acceptés.");
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setError("");
    setResult(null);
  }, [isValidFile]);
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile: File | undefined = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile: File | undefined = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);
  const handleUpload = useCallback(async (): Promise<void> => {
    if (!file) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }
    if (campaignId.length === 0) {
      setError("Veuillez sélectionner une campagne de destination.");
      return;
    }
    setIsUploading(true);
    setError("");
    setResult(null);
    const formData: FormData = new FormData();
    formData.append("file", file);
    formData.append("campaignId", campaignId);
    try {
      const response: Response = await fetch("/api/contacts/import", {
        method: "POST",
        body: formData,
      });
      const payload: ImportResult = await response.json();
      if (!payload.ok) {
        setError(payload.message);
      } else {
        setResult(payload);
      }
    } catch {
      setError("Erreur de connexion au serveur.");
    }
    setIsUploading(false);
  }, [file, campaignId]);
  const handleClose = useCallback((): void => {
    setIsOpen(false);
    if (result && result.imported > 0) {
      router.refresh();
    }
    setTimeout(() => {
      setFile(null);
      setCampaignId("");
      setResult(null);
      setError("");
    }, 300);
  }, [result, router]);
  const formatFileSize = useCallback(({ bytes }: Readonly<{ bytes: number }>): string => {
    if (bytes < 1024) {
      return `${bytes} o`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} Ko`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }, []);
  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-2 rounded-xl border-zinc-200 text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/10"
      >
        <FileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-400" />
        Importer Excel
      </Button>
      <FormDialog
        isOpen={isOpen}
        onClose={handleClose}
        title="Importer des contacts"
        description="Uploadez un fichier Excel (.xls ou .xlsx) contenant vos contacts."
        icon={<Upload className="size-5 text-lbs-blue dark:text-blue-300" />}
        maxWidth="max-w-lg"
      >
        {result ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="font-medium text-emerald-800 dark:text-emerald-200">Import terminé</p>
                  <p className="mt-0.5 text-sm text-emerald-700 dark:text-emerald-300">{result.message}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-zinc-100 p-3 text-center dark:border-white/10">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{result.imported}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">importés</p>
              </div>
              <div className="rounded-xl border border-zinc-100 p-3 text-center dark:border-white/10">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{result.skipped}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">ignorés</p>
              </div>
            </div>
            {result.errors.length > 0 ? (
              <div className="max-h-32 overflow-y-auto rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-500/10">
                <p className="mb-1 text-xs font-medium text-amber-700 dark:text-amber-300">Détails :</p>
                {result.errors.map((err, idx) => (
                  <p key={idx} className="text-xs text-amber-600 dark:text-amber-400">{err}</p>
                ))}
              </div>
            ) : null}
            <div className="flex justify-end border-t border-zinc-100 pt-4 dark:border-white/5">
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
              >
                <CheckCircle2 className="size-3.5" />
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
                isDragging
                  ? "border-lbs-blue bg-lbs-blue/5 dark:border-blue-400 dark:bg-blue-500/10"
                  : file
                    ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-500/5"
                    : "border-zinc-300 hover:border-zinc-400 dark:border-white/20 dark:hover:border-white/30"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xls,.xlsx"
                onChange={handleInputChange}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="grid size-12 place-items-center rounded-xl bg-emerald-100 dark:bg-emerald-500/15">
                    <FileSpreadsheet className="size-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-zinc-800 dark:text-white">{file.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{formatFileSize({ bytes: file.size })}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                    className="ml-2 grid size-7 place-items-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-200"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <>
                  <UploadCloud className={`mx-auto mb-3 size-10 ${isDragging ? "text-lbs-blue dark:text-blue-400" : "text-zinc-400 dark:text-zinc-500"}`} />
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {isDragging ? "Déposez le fichier ici" : "Glissez votre fichier Excel ici"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">ou cliquez pour parcourir</p>
                  <p className="mt-2 text-[10px] text-zinc-400">Formats acceptés : .xls, .xlsx</p>
                </>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Campagne de destination *</label>
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-lbs-blue focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
              >
                <option value="">Sélectionner une campagne</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            {error.length > 0 ? (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            ) : null}
            <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-white/5">
              <Button type="button" variant="ghost" onClick={handleClose} className="text-zinc-500">
                Annuler
              </Button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading || !file || campaignId.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110 disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {isUploading ? "Import en cours..." : "Lancer l'import"}
              </button>
            </div>
          </div>
        )}
      </FormDialog>
    </>
  );
};
