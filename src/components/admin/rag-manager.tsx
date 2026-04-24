"use client";
import { useState, useRef, useCallback } from "react";
import { FileText, Trash2, Upload, Loader2, CheckCircle2, AlertCircle, RefreshCw, Database } from "lucide-react";

type StoredDocument = Readonly<{
  document_name: string;
  chunk_count: number;
  created_at: string;
}>;

type UploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "success"; message: string; chunks: number }
  | { status: "error"; message: string };

export const RagManager = (): React.JSX.Element => {
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/documents");
      const data = await res.json() as { ok: boolean; documents: StoredDocument[] };
      if (data.ok) setDocuments(data.documents);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, []);

  const handleTabActivate = (): void => {
    if (!hasFetched) fetchDocuments();
  };

  const handleFileUpload = async (file: File): Promise<void> => {
    setUploadState({ status: "uploading" });
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/ai/ingest", { method: "POST", body: formData });
      const data = await res.json() as { ok: boolean; message: string; chunks_stored: number; error?: string };
      if (data.ok) {
        setUploadState({ status: "success", message: data.message, chunks: data.chunks_stored });
        await fetchDocuments();
      } else {
        setUploadState({ status: "error", message: data.error ?? "Erreur inconnue." });
      }
    } catch {
      setUploadState({ status: "error", message: "Erreur réseau lors de l'upload." });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = "";
  };

  const handleDelete = async (documentName: string): Promise<void> => {
    setDeletingDoc(documentName);
    try {
      const res = await fetch("/api/ai/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_name: documentName }),
      });
      const data = await res.json() as { ok: boolean };
      if (data.ok) setDocuments((prev) => prev.filter((d) => d.document_name !== documentName));
    } catch {
      // silently fail
    } finally {
      setDeletingDoc(null);
    }
  };

  return (
    <div className="space-y-6" onFocus={handleTabActivate}>
      {/* Upload zone */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Ajouter un document à la base de connaissances</h3>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => uploadState.status !== "uploading" && fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 transition-colors ${
            uploadState.status === "uploading"
              ? "cursor-not-allowed border-zinc-300 bg-zinc-50 dark:border-white/10 dark:bg-white/5"
              : "border-zinc-300 bg-zinc-50 hover:border-[#244976] hover:bg-blue-50/30 dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-400"
          }`}
        >
          {uploadState.status === "uploading" ? (
            <>
              <Loader2 className="size-8 animate-spin text-[#244976] dark:text-blue-400" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Traitement en cours — génération des embeddings...</p>
            </>
          ) : (
            <>
              <div className="grid size-12 place-items-center rounded-xl bg-[#244976]/10 dark:bg-blue-400/10">
                <Upload className="size-6 text-[#244976] dark:text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Glissez un fichier ou cliquez pour sélectionner</p>
                <p className="mt-1 text-xs text-zinc-400">PDF, TXT, Markdown — max 20 Mo</p>
              </div>
            </>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept=".pdf,.txt,.md" className="hidden" onChange={handleInputChange} />

        {uploadState.status === "success" ? (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" />
            {uploadState.message}
          </div>
        ) : uploadState.status === "error" ? (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
            <AlertCircle className="size-4 shrink-0" />
            {uploadState.message}
          </div>
        ) : null}
      </div>

      {/* Documents list */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            <Database className="mr-1.5 inline size-4" />
            Base de connaissances
          </h3>
          <button
            type="button"
            onClick={fetchDocuments}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-white/10"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>

        {!hasFetched ? (
          <button
            type="button"
            onClick={fetchDocuments}
            className="w-full rounded-xl border border-dashed border-zinc-200 py-8 text-sm text-zinc-400 transition hover:border-zinc-300 dark:border-white/10"
          >
            Cliquez pour charger les documents indexés
          </button>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-6 animate-spin text-zinc-400" />
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 py-10 text-center text-sm text-zinc-400 dark:border-white/10">
            Aucun document dans la base de connaissances. Importez un PDF ci-dessus.
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.document_name}
                className="flex items-center gap-3 rounded-xl border border-zinc-200/70 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5"
              >
                <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#244976]/10 dark:bg-blue-400/10">
                  <FileText className="size-4 text-[#244976] dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-800 dark:text-white">{doc.document_name}</p>
                  <p className="text-xs text-zinc-400">
                    {doc.chunk_count} segment{doc.chunk_count > 1 ? "s" : ""} · indexé le{" "}
                    {new Date(doc.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(doc.document_name)}
                  disabled={deletingDoc === doc.document_name}
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                >
                  {deletingDoc === doc.document_name ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
