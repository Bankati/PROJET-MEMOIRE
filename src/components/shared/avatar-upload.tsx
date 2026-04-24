"use client";
/**
 * Composant d'upload de photo de profil.
 * Clique sur le bouton Camera → ouvre le sélecteur de fichier → prévisualisation
 * immédiate → upload vers /api/profile/avatar → mise à jour en DB.
 */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";

type AvatarUploadProps = Readonly<{
  currentAvatarUrl: string | null;
  initials: string;
  size?: "md" | "lg";
  shape?: "circle" | "rounded";
}>;

type UploadState = "idle" | "uploading" | "error";

export const AvatarUpload = ({
  currentAvatarUrl,
  initials,
  size = "md",
  shape = "circle",
}: AvatarUploadProps): React.JSX.Element => {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClass = size === "lg" ? "size-20" : "size-24";
  const shapeClass = shape === "rounded" ? "rounded-2xl" : "rounded-full";
  const textSize = size === "lg" ? "text-2xl" : "text-2xl";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploadState("uploading");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json() as { ok: boolean; avatarUrl?: string; message?: string };
      if (!payload.ok) {
        setPreviewUrl(currentAvatarUrl);
        setErrorMsg(payload.message ?? "Erreur lors de l'upload.");
        setUploadState("error");
        return;
      }
      setPreviewUrl(payload.avatarUrl ?? localPreview);
      setUploadState("idle");
      router.refresh();
    } catch {
      setPreviewUrl(currentAvatarUrl);
      setErrorMsg("Erreur réseau. Réessayez.");
      setUploadState("error");
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative mx-auto ${sizeClass}`}>
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Photo de profil"
            className={`${sizeClass} object-cover ${shapeClass}`}
          />
        ) : (
          <div className={`grid ${sizeClass} place-items-center ${shapeClass} bg-gradient-to-br from-[#244976] to-[#21416C] ${textSize} font-bold text-white`}>
            {initials}
          </div>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploadState === "uploading"}
          className={`absolute bottom-0 right-0 grid size-8 place-items-center rounded-full border-2 border-white bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200 disabled:opacity-60 dark:border-[#1a2332] dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600 ${shape === "rounded" ? "-bottom-1 -right-1" : ""}`}
          title="Changer la photo"
        >
          {uploadState === "uploading"
            ? <Loader2 className="size-3.5 animate-spin" />
            : <Camera className="size-3.5" />
          }
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      {uploadState === "error" && errorMsg.length > 0 ? (
        <p className="text-center text-xs text-rose-500 dark:text-rose-400">{errorMsg}</p>
      ) : null}
      {uploadState === "idle" && previewUrl !== currentAvatarUrl && previewUrl !== null ? (
        <p className="text-center text-xs text-emerald-600 dark:text-emerald-400">Photo mise à jour ✓</p>
      ) : null}
      <p className="text-center text-xs text-zinc-400">JPEG, PNG ou WebP — max 2 Mo</p>
    </div>
  );
};
