# Format du fichier Excel d'import de contacts

Documente le format attendu par l'import Excel (`ImportExcelDialog` → `POST /api/contacts/import`), à destination des administrateurs qui préparent leurs fichiers.

## Fichier

- Formats acceptés : `.xls`, `.xlsx`.
- Une seule feuille est lue (la première du classeur).
- La première ligne du tableau doit contenir les en-têtes de colonnes.
- Aucune limite de taille n'est appliquée par l'application.

## Colonnes

L'ordre des colonnes n'a pas d'importance. Les noms d'en-têtes sont reconnus **sans tenir compte de la casse ni des accents mal saisis**, parmi les alias suivants (un seul suffit par colonne) :

| Donnée                  | Obligatoire          | Alias d'en-têtes acceptés                                                                                                                                                                                |
| ----------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prénom                  | Oui si Nom absent    | `prénom`, `prenom`, `firstname`, `first_name`, `first name`, `nom_prenom`, `prénom de l'élève`, `prenom_eleve`                                                                                           |
| Nom                     | Oui si Prénom absent | `nom`, `lastname`, `last_name`, `last name`, `nom de famille`, `nom_famille`, `nom de l'élève`, `nom_eleve`                                                                                              |
| Téléphone principal     | **Oui**              | `numéro de téléphone`, `numero de telephone`, `téléphone`, `telephone`, `tel`, `phone`, `phone_primary`, `téléphone principal`, `tel1`, `numéro`, `numero`, `contact`                                    |
| Téléphone secondaire    | Non                  | `téléphone 2`, `telephone 2`, `tel2`, `phone_secondary`, `téléphone secondaire`, `tel secondaire`, `numéro 2`                                                                                            |
| Email                   | Non                  | `email`, `e-mail`, `mail`, `adresse email`, `adresse_email`, `courriel`                                                                                                                                  |
| Établissement d'origine | Non                  | `établissement d'origine`, `etablissement d'origine`, `école`, `ecole`, `school`, `school_name`, `établissement`, `etablissement`, `nom de l'école`, `nom_ecole`, `lycée`, `lycee`, `collège`, `college` |
| Filière souhaitée       | Non                  | `filière`, `filiere`, `programme`, `program`, `desired_program`, `filière souhaitée`, `filiere souhaitee`, `spécialité`, `specialite`, `formation`                                                       |
| Ville                   | Non                  | `ville`, `city`, `localité`, `localite`, `commune`, `région`, `region`                                                                                                                                   |

## Règles de validation

Une ligne est **ignorée** (comptée dans `skipped`, avec un message dans `errors`) si :

- Prénom **et** Nom sont tous les deux vides ("Ligne N : prénom ou nom manquant."), ou
- Le téléphone principal est vide ("Ligne N : numéro de téléphone manquant.").

Aucune autre validation n'est appliquée : pas de contrôle de format d'email, pas de contrôle de format de téléphone (au-delà de la normalisation ci-dessous).

## Normalisation et dédoublonnage

- Les numéros sont normalisés avant comparaison : les espaces sont supprimés et un `00` en début de numéro est remplacé par `+`.
- Un contact existant est identifié par son **téléphone principal normalisé**. S'il existe déjà en base (toutes campagnes confondues), il n'est pas recréé — il est simplement rattaché à la campagne ciblée par l'import.
- Si le contact est déjà rattaché à cette même campagne, le rattachement est ignoré silencieusement (pas d'erreur, pas de doublon).

## Réponse de l'import

```json
{
  "ok": true,
  "imported": 42,
  "skipped": 3,
  "errors": ["Ligne 5 : numéro de téléphone manquant.", "..."],
  "message": "42 contacts importés, 3 ignorés."
}
```

## Exemple de fichier minimal

| Prénom | Nom    | Téléphone     | Établissement |
| ------ | ------ | ------------- | ------------- |
| Awa    | Kondo  | +22890123456  | Lycée Moderne |
| Koffi  | Mensah | 0022891234567 | —             |
