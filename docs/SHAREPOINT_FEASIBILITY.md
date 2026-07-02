# Étude de faisabilité — Import depuis SharePoint

Évalue la possibilité d'importer des données (contacts, scripts de campagne) directement depuis une instance SharePoint, en s'appuyant sur l'infrastructure d'import existante (`api/contacts/import`, parsing `xlsx`).

## État actuel

Aucune dépendance Microsoft Graph, MSAL ou SharePoint n'est présente dans le projet (`package.json` vérifié). L'import de contacts se fait aujourd'hui par upload manuel d'un fichier Excel local (voir [IMPORT_CONTACTS.md](./IMPORT_CONTACTS.md)).

## Faisabilité technique : oui, réalisable

Microsoft expose SharePoint via **Microsoft Graph API**, qui permet de lister des bibliothèques de documents et de télécharger un fichier par son chemin, sans quitter l'écosystème Node.js/Next.js déjà en place.

## Prérequis

1. **Enregistrement d'application dans Azure AD** (Entra ID), côté tenant Microsoft 365 de LBS — nécessite un administrateur du tenant, pas seulement un accès SharePoint.
2. **Permissions Graph API** à accorder à l'application, avec consentement admin :
   - `Sites.Read.All` (lecture des bibliothèques de documents), ou `Sites.Selected` pour restreindre l'accès à un site SharePoint précis (recommandé — principe du moindre privilège).
   - `Files.Read.All` si les fichiers sont hors bibliothèque de site standard.
3. **Choix du flux d'authentification** :
   - **Application (client credentials / daemon)** : le backend s'authentifie lui-même avec un secret/certificat, sans utilisateur connecté. Adapté ici puisque l'import est déclenché par un admin depuis le dashboard, sans navigation OAuth interactive. C'est l'approche recommandée.
   - **Délégué (on-behalf-of)** : nécessiterait que l'admin se connecte avec son compte Microsoft à chaque import — plus lourd, à éviter sauf besoin explicite de traçabilité "qui a importé quoi avec ses propres droits SharePoint".
4. **Nouvelles dépendances** : `@azure/msal-node` (authentification) + `@microsoft/microsoft-graph-client` (appels Graph), ou de simples appels `fetch` vers `https://graph.microsoft.com/v1.0/...` si on veut éviter d'alourdir les dépendances.
5. **Secrets à stocker** : `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` (ou certificat), `AZURE_TENANT_ID` — à ajouter aux variables d'environnement au même titre que les secrets Supabase existants (`src/lib/env.ts`).

## Étapes d'intégration

1. Créer l'app registration Azure AD et obtenir le consentement admin sur les permissions Graph (étape administrative, hors code — délai dépendant de l'IT de LBS).
2. Ajouter un client Graph authentifié côté serveur (`src/lib/sharepoint.ts`, sur le modèle de `src/lib/supabase.ts`), utilisant le flux client credentials.
3. Exposer un point d'entrée pour lister les fichiers Excel disponibles dans un dossier SharePoint donné (choisi par l'admin dans l'UI, ou fixé par configuration).
4. Télécharger le fichier choisi en `ArrayBuffer` via Graph (`/sites/{site-id}/drive/items/{item-id}/content`), puis **réutiliser telle quelle** la logique de parsing existante (`XLSX.read` + `parseRow` de `api/contacts/import/route.ts`) — aucune duplication de la logique métier de validation/dédoublonnage nécessaire.
5. Pour les scripts de campagne (PDF), même principe : télécharger le fichier depuis SharePoint puis le passer à `uploadCampaignScript()` (stockage Supabase existant) plutôt que de dépendre de SharePoint comme stockage permanent — évite un couplage fort avec un système externe pour l'affichage aux agents.

## Implications

- **Dépendance externe supplémentaire** : disponibilité de l'import liée à celle de Microsoft Graph et à la configuration Azure AD (rotation du secret/certificat à anticiper).
- **Gouvernance des accès** : nécessite la coopération d'un administrateur IT côté LBS pour l'enregistrement Azure AD — ce n'est pas une tâche purement applicative.
- **Complexité UX** : il faudra une interface pour naviguer/sélectionner un fichier SharePoint (site → bibliothèque → dossier → fichier), plus complexe qu'un simple `<input type="file">`.
- **Effort estimé** : configuration Azure AD + client Graph + UI de navigation ≈ plusieurs jours, la majeure partie du travail de parsing/validation étant déjà réutilisable telle quelle.

## Recommandation

Faisable sans changement d'architecture majeur, mais dépend d'un préalable non technique (accès admin Azure AD côté LBS). À ne prioriser que si l'usage réel justifie l'effort de configuration — sinon l'upload manuel actuel reste la voie la plus simple et déjà opérationnelle.
