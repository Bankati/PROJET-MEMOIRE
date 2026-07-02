Voici la traduction en français de ce troisième document, conservant à l'identique le formatage Markdown et la structure d'origine.

---

---

## name: remember

description: Enregistrez ce qui compte à la fin d'une session pour que la suivante reprenne exactement là où vous vous étiez arrêté. Ou restaurez le contexte au début d'une nouvelle session pour que rien ne soit perdu entre-temps.

L'IA n'a pas de mémoire d'une session à l'autre. Chaque nouvelle session démarre de zéro. Cette compétence corrige ce problème.

Exécutez-la à la fin d'une session pour sauvegarder. Exécutez-la au début d'une nouvelle session pour restaurer. C'est tout ce qu'elle fait — mais si elle est utilisée de manière systématique, plus rien ne sera jamais perdu.

## Limite de sécurité

Cette compétence ne doit jamais stocker de secrets. Si une valeur sensible apparaît dans la conversation ou le contexte, ne la copiez pas dans `memory.md`.

Les données sensibles incluent (liste non exhaustive) :

- Les clés API, les jetons d'accès (access tokens), les jetons de rafraîchissement, les jetons de session.
- Les mots de passe, les phrases de passe, les codes à usage unique, les clés privées, les certificats.
- Les cookies, les en-têtes d'authentification, les chaînes de connexion, les secrets de webhooks.
- Toute valeur s'apparentant à un identifiant ou toute chaîne ressemblant à un secret.

Si un détail est utile mais sensible, stockez plutôt un indicateur expurgé (par exemple : `[REDACTED_API_KEY]`).
En cas de doute sur la sensibilité d'un élément, considérez-le comme sensible et omettez-le ou masquez-le.

## Comment l'invoquer

**Pour sauvegarder à la fin d'une session :**

```
/remember save

```

**Pour restaurer au début d'une nouvelle session :**

```
/remember restore

```

Si le développeur exécute simplement `/remember` sans précision — demandez-le-lui de quoi il a besoin.

---

## Mode Sauvegarde (Save Mode)

Lorsque le développeur exécute `/remember save` :

### Ce qu'il faut capturer

Passez en revue la conversation en cours pour en extraire uniquement ce dont un développeur aurait réellement besoin pour poursuivre ce travail dans un contexte totalement neuf. N'incluez pas de données sensibles telles que des identifiants, des clés API ou des jetons dans la mémoire sauvegardée. Il ne s'agit ni d'une transcription, ni d'un résumé de tout ce qui s'est passé, mais de l'état essentiel du projet.

Pensez comme quelqu'un qui passe le relais sur un projet à un collègue tout aussi qualifié, mais qui ne sait rien de ce qui s'est fait aujourd'hui. De quoi aurait-il besoin pour continuer sans rien perdre ?

Capturez :

**Ce qui a été créé** — les fichiers spécifiques créés ou modifiés, les fonctionnalités terminées, les composants ajoutés. Soyez précis. Pas de "création du flux d'authentification" — préférez "création de `app/(auth)/login/page.tsx`, `app/(auth)/callback/page.tsx`, et `middleware.ts`. Authentification OAuth avec Google et GitHub opérationnelle de bout en bout."

**Les décisions prises** — les choix qui seraient difficiles à inverser ou dont dépend le travail futur. Pas les détails d'implémentation — les choix d'architecture. "Choix de la récupération de données côté serveur (server-side) plutôt que côté client — évite les états de chargement et garde la logique sensible hors du client."

**Les problèmes résolus** — tout problème qui a demandé du temps à résoudre. Ainsi, la prochaine session ne résoudra pas deux fois le même problème. "Le callback d'authentification tiers nécessite un slash final dans l'URL de redirection — corrigé dans le gestionnaire de callback."

**L'état actuel** — exactement où en sont les choses en ce moment. Ce qui fonctionne, ce qui est partiel, ce qui est notoirement cassé.

**Ce qui vient ensuite** — la toute prochaine action à mener. Assez précise pour que la session suivante puisse démarrer immédiatement sans avoir à chercher par où commencer.

**Les questions en suspens** — tout élément non résolu que la prochaine session devra traiter.

### Ce qu'il ne faut pas capturer

- Les détails d'implémentation qui sont visibles dans le code.
- Les décisions déjà documentées dans les fichiers de contexte.
- Tout ce qui peut être déduit en lisant la base de code.
- Le processus de création d'un élément — uniquement ce qui a été construit et ce qui a été décidé.
- Tout secret ou valeur de type identifiant (jetons, clés, mots de passe, cookies, en-têtes d'authentification, chaînes de connexion).

### Vérification de sécurité avant l'écriture

Avant d'écrire dans `memory.md`, effectuez une dernière vérification du contenu pour vous assurer qu'aucune valeur sensible n'est présente.

- Si un contenu sensible est trouvé, supprimez-le ou masquez-le avant d'écrire.
- Ne conservez que le contexte minimal non sensible nécessaire pour poursuivre la session suivante.

### Où sauvegarder

Écrivez la mémoire dans un fichier `memory.md` à la racine du projet. Ce fichier contient toujours uniquement l'état de la session la plus récente.

Si `memory.md` existe déjà, affichez un bref résumé de ce qui est actuellement sauvegardé au développeur et demandez sa confirmation avant d'écraser le fichier :

Étape 1 — Lisez `memory.md`, fournissez le résumé en une ligne et arrêtez-vous pour attendre la réponse du développeur :

```
memory.md existe déjà depuis une session précédente.
La mémoire actuelle couvre : [résumé en une ligne du contenu existant].

Écraser avec la mémoire de cette session ? (oui / non)

```

Étape 2 — Après la réponse du développeur :

- S'il répond **oui**, écrivez le nouveau fichier `memory.md`.
- S'il répond **non**, n'écrivez rien et répondez :

```
Aucune modification apportée. memory.md reste inchangé.

```

### Format

```markdown
# Mémoire — [Nom de la fonctionnalité ou de la session]

Dernière mise à jour : [date et heure]

## Ce qui a été créé

[Fichiers spécifiques, composants, fonctionnalités terminés durant cette session]

## Décisions prises

[Décisions architecturales et d'implémentation dont dépend le travail futur]

## Problèmes résolus

[Problèmes résolus durant cette session — pour éviter d'avoir à les résoudre à nouveau]

## État actuel

[Exactement où en sont les choses — ce qui fonctionne, ce qui est partiel, ce qui est cassé]

## La prochaine session commencera par

[La toute première chose à faire lors de la prochaine session — spécifique et exploitable]

## Questions en suspens

[Tout élément non résolu qui nécessite une attention particulière]
```

Après avoir écrit le fichier, confirmez au développeur :

```
Mémoire sauvegardée dans memory.md.

Prochaine session : exécutez /remember restore pour reprendre ici.

```

---

## Mode Restauration (Restore Mode)

Lorsque le développeur exécute `/remember restore` au début d'une nouvelle session :

### Étape 1 — Trouver la mémoire

Recherchez `memory.md` à la racine du projet. S'il n'existe pas, dites-le au développeur :

```
Aucun fichier memory.md trouvé dans ce projet.

Soit il s'agit de la première session, soit le fichier n'a pas été sauvegardé.
Pour sauvegarder la mémoire à la fin d'une session, exécutez /remember save.

```

### Étape 2 — Lire tout ce qui est disponible

Lisez d'abord `memory.md`. Vérifiez ensuite la présence de ces fichiers de contexte spécifiques s'ils existent et lisez uniquement ceux-là :

- `CLAUDE.md`, `.claude/context.md` — Claude Code
- `.github/copilot-instructions.md` — GitHub Copilot
- `.cursorrules`, `.cursor/rules/` — Cursor
- `.windsurfrules` — Windsurf
- `AGENTS.md` — Codex
- `.clinerules` — Cline
- `context.md` — alternative générique

Ne scannez et ne lisez aucun autre fichier en dehors de cette liste. Établissez l'image la plus complète possible à partir de ce qui est disponible.

Lors de la restauration, ne répétez et ne faites jamais remonter de secrets bruts, quelle qu'en soit la source. Si un secret apparaît dans le contexte restauré, résumez-le uniquement sous une forme masquée.

### Étape 3 — Confirmer ce qui a été restauré

Ne commencez pas à coder. Ne supposez pas que le développeur souhaite continuer immédiatement. Résumez ce qui a été restauré pour que le développeur puisse vérifier si Claude a bien compris.

```
Mémoire restaurée. Voici où nous en sommes :

**Dernière session :** [ce qui a été créé]
**État actuel :** [ce qui fonctionne en ce moment]
**Décisions en place :** [décisions clés qui sont actées]
**Étape suivante :** [par quoi la prochaine session doit commencer]

Est-ce correct ? Répondez oui pour continuer, ou corrigez tout ce qui
ne semble pas exact avant que nous ne procédions.

```

La session ne se poursuit qu'après la confirmation explicite du développeur.

### Si la mémoire est incomplète ou obscure

Si `memory.md` existe mais qu'un contexte important semble manquer, dites-le honnêtement :

```
J'ai trouvé memory.md mais certains éléments de contexte semblent manquer —
[ce qui est flou ou absent].

Devons-nous continuer avec ce que nous avons, ou souhaitez-vous
combler les lacunes avant que nous ne commencions ?

```

Ne devinez pas. Ne présumez pas. Mettez en évidence le manque et laissez le développeur décider.

---

## La Règle

Chaque session se termine par `/remember save`.
Chaque session commence par `/remember restore`.

## Tout le système repose là-dessus. C'est l'utilisation systématique qui en garantit l'efficacité.

Une compétence utilisée de temps en temps est une compétence sur laquelle on ne peut pas compter.
