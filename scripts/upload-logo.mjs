import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Lire les variables d'environnement depuis .env.local
const envPath = join(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const envVars = Object.fromEntries(
  envContent
    .split("\n")
    .filter((line) => line.includes("=") && !line.startsWith("#"))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key.trim(), rest.join("=").trim().replace(/^"|"$/g, "")];
    }),
);

const SUPABASE_URL = envVars.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET = "assets";
const FILE_PATH = "lbs-logo.jpeg";
const LOCAL_PATH = join(__dirname, "../public/LBS LOGO.jpeg");

async function main() {
  // Créer le bucket public si nécessaire
  const { error: bucketError } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
  });
  if (bucketError && !bucketError.message.toLowerCase().includes("already exists")) {
    console.error("Erreur création bucket:", bucketError.message);
    process.exit(1);
  }

  // Uploader le logo
  const fileBuffer = readFileSync(LOCAL_PATH);
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(FILE_PATH, fileBuffer, { contentType: "image/jpeg", upsert: true });

  if (uploadError) {
    console.error("Erreur upload:", uploadError.message);
    process.exit(1);
  }

  // Récupérer l'URL publique
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(FILE_PATH);
  console.log("\n✅ Logo uploadé avec succès !");
  console.log("URL publique :", data.publicUrl);
}

main();
