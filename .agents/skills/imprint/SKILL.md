Voici la traduction en français de votre document, tout en conservant scrupuleusement le formatage Markdown et la structure d'origine.

---

---

## name: imprint

description: Après avoir créé un composant UI, extrayez les motifs visuels essentiels à la cohérence et enregistrez-les dans ui-registry.md. Ainsi, chaque composant créé par la suite s'alignera sur ce qui a été fait précédemment.

La cohérence d'une UI ne relève pas du hasard. Elle existe parce que chaque composant est conçu en ayant conscience de ce qui existe déjà.

Le problème avec les interfaces générées par IA, c'est que chaque composant est construit de manière isolée. L'agent ne se souvient pas de ce qu'il a créé trois sessions auparavant. Résultat : les espacements dérivent, les couleurs varient légèrement, les rayons de bordure (border-radius) deviennent incohérents. L'application donne l'impression d'avoir été codée par plusieurs personnes aux goûts différents.

Cette compétence corrige ce problème. Exécutez-la après la création de n'importe quel composant UI. Elle analyse ce qui vient d'être codé, en extrait les motifs (patterns) essentiels à la cohérence visuelle et les sauvegarde pour que tous les futurs composants s'y conforment.

Une seule commande. À exécuter à chaque fois. Tout le système repose là-dessus.

---

## Comment l'invoquer

Après avoir créé un composant UI, exécutez :

```
/imprint

```

Pour cibler un fichier spécifique :

```
/imprint [chemin_du_fichier]

```

Pour auditer une base de code existante à la recherche d'incohérences :

```
/imprint audit

```

Si aucun chemin de fichier n'est renseigné, la compétence identifie automatiquement les fichiers de composants récemment créés ou modifiés et extrait les données à partir de ceux-ci.

**Quand utiliser le mode audit :**

- Le projet UI existe déjà et sa cohérence est incertaine.
- Plusieurs sessions se sont écoulées sans exécuter `/imprint`.
- Quelque chose semble visuellement incorrect, mais il est difficile d'en identifier la cause précise.
- Avant de générer le fichier `ui-registry.md` pour la première fois sur un projet existant.

Exécutez `/imprint audit` avant de lancer `/imprint` sur tout projet dont l'UI n'a pas été suivie dès le départ.

---

## Étape 1 — Identifier ce qui vient d'être créé

Si un chemin de fichier a été fourni : lisez directement ce fichier.

Si aucun chemin de fichier n'a été fourni : identifiez les fichiers de composants qui ont été créés ou modifiés le plus récemment au cours de cette session. Cherchez dans le répertoire des composants (`components`) et dans tout autre emplacement où résident habituellement les fichiers UI. Lisez ces fichiers.

Si le choix des fichiers à analyser est ambigu, demandez au développeur :

```
De quel composant dois-je extraire les motifs ?

```

---

## Étape 2 — Extraire ce qui est essentiel à la cohérence

Lisez le code du composant. Extrayez uniquement les classes et les valeurs qui affectent la cohérence visuelle de l'interface. Pas besoin de tout prendre — seulement ce qui fait que les composants semblent appartenir au même ensemble.

**À extraire :**

- Arrière-plan (Background) — quelle classe `bg-` est utilisée pour le conteneur, les cartes, les panneaux.
- Bordure (Border) — couleur, épaisseur et style de la bordure.
- Rayon de bordure (Border radius) — quelle classe `rounded-` est utilisée pour ce type de composant.
- Couleurs de texte — classes pour le texte principal, secondaire et atténué (`muted`).
- Tailles et graisses de texte — pour les titres, le corps de texte, les étiquettes, les légendes.
- Espacement (Spacing) — marges internes (`padding`) dans le composant, écart (`gap`) entre les éléments.
- États interactifs — classes pour les états `:hover`, `:focus`, `:active`.
- Ombre (Shadow) — si applicable.
- Toute utilisation de couleur d'accentuation ou de marque.

**À ne pas extraire :**

- Largeur et hauteur (Width / height) — trop dépendantes du contexte pour constituer une règle de cohérence.
- Mises en page Flex et Grid — structurelles, non visuelles.
- Positionnement — `absolute`, `relative`, `z-index` — dépendant du contexte.
- Animations et durées de transition — sauf s'il s'agit d'un motif récurrent à imposer.
- Variantes de points de rupture (breakpoints) responsives — capturez uniquement le motif de base.

---

## Étape 3 — Écrire dans ui-registry.md

Ouvrez `ui-registry.md`. Si le fichier n'existe pas, créez-le.

Ajoutez une nouvelle entrée pour le composant qui vient d'être analysé. N'écrasez pas les entrées existantes — ajoutez-les à la fin du registre.

Si une entrée pour ce type de composant existe déjà : mettez-la à jour plutôt que de la dupliquer.

### Format de l'entrée

```markdown
### [Nom du composant]

Fichier : [chemin_du_fichier]
Dernière mise à jour : [date]

| Propriété          | Classe            |
| ------------------ | ----------------- |
| Arrière-plan       | [classe]          |
| Bordure            | [classe]          |
| Rayon de bordure   | [classe]          |
| Texte — principal  | [classe]          |
| Texte — secondaire | [classe]          |
| Espacement         | [classe]          |
| État au survol     | [classe]          |
| Ombre              | [classe ou aucun] |
| Couleur d'accent   | [classe ou aucun] |

**Notes sur le motif :**
[Toute décision importante concernant le motif qui mérite d'être notée —
pourquoi une classe spécifique a été choisie, avec quoi ce composant
doit toujours s'aligner, quelles variations sont autorisées]
```

---

## Étape 4 — Confirmer les éléments extraits

Après avoir écrit dans `ui-registry.md`, confirmez l'action au développeur :

```
Motifs enregistrés pour [Nom du composant] → ui-registry.md

Éléments capturés :
- Arrière-plan : [classe]
- Bordure : [classe]
- Rayon de bordure : [classe]
- Texte : [classes]
- Espacement : [classes]
- Survol : [classe]

Tout futur composant de ce type devra s'aligner sur ces motifs.

```

Si un élément a semblé incohérent ou surprenant lors de l'extraction, signalez-le :

```
Note : [Quelque chose qui semblait incohérent ou qui mérite
d'être porté à la attention du développeur]

```

---

## Comment ui-registry.md est utilisé

Le registre n'est pas une simple archive. C'est le garant de la cohérence pour toutes les sessions à venir.

Au début de chaque session impliquant du travail sur l'UI, Claude lit `ui-registry.md` avant de coder le moindre composant. Lors de la création d'une nouvelle carte, il vérifie comment les cartes existantes ont été construites. Lors de la création d'un nouveau bouton, il vérifie quels motifs de boutons existent déjà. Lors de la création d'un badge de statut, il réutilise exactement les mêmes classes.

Le registre s'enrichit à mesure que le projet grandit. Plus le nombre de composants enregistrés est élevé, plus les nouveaux composants seront cohérents — car Claude dispose toujours d'une référence précise de ce qui existe déjà.

---

## La Règle

Créez un composant. Exécutez `/imprint`. Passez à la suite.

À chaque fois. Sans exception.

Un registre avec dix entrées est utile. Un registre avec trente entrées est puissant. Un registre mis à jour de manière intermittente n'est pas fiable.

La cohérence est une habitude, pas une fonctionnalité.

---

## Mode Audit — /imprint audit

Exécutez cette commande lorsque l'UI existe déjà et que la cohérence est incertaine. Au lieu de se limiter à un seul composant, elle scanne l'ensemble de la base de code, identifie les conflits et établit une base de référence propre avant toute nouvelle extraction.

### Étape 1 — Scanner tous les composants UI

Trouvez chaque fichier de composant dans le projet. Lisez-les tous. Établissez une vue d'ensemble complète des motifs visuels actuellement utilisés sur l'ensemble de l'interface.

### Étape 2 — Identifier les conflits

Pour chaque propriété visuelle essentielle à la cohérence, listez toutes les variations trouvées :

```
## Audit de cohérence de l'UI

### Conflits identifiés

**Rayon de bordure (Border radius)**
[Listez chaque variante de rounded- trouvée et quels composants l'utilisent]
Recommandation : [sur laquelle se standardiser et pourquoi]

**Couleurs d'arrière-plan**
[Listez chaque classe bg- trouvée — signalez les valeurs hexadécimales codées en dur]
Recommandation : [par quelles classes de jetons (tokens) les remplacer]

**Couleurs de texte**
[Listez chaque classe de couleur text- trouvée — signalez celles qui contournent le système de design]
Recommandation : [par quelles classes de jetons les remplacer]

**Espacement**
[Listez les variations de padding et de gap trouvées]
Recommandation : [sur quelles valeurs se standardiser]

**Couleurs de bordure**
[Listez chaque classe de couleur de bordure trouvée]
Recommandation : [sur quelle classe de jeton se standardiser]

**États interactifs**
[Listez les variations de survol (hover), focus et active trouvées]
Recommandation : [sur quel motif se standardiser]

### Valeurs codées en dur identifiées
[Listez chaque valeur hexadécimale codée en dur, classe de couleur brute, ou
valeur hors jeton identifiée — avec le fichier et la ligne correspondante]
Ces valeurs doivent être remplacées par des jetons du système de design (design system tokens).

### Base de référence recommandée
[Le motif correct pour chaque propriété —
basé sur ce que la majorité utilise déjà correctement
et sur ce que le système de design définit]

```

### Étape 3 — Attendre la confirmation du développeur

Présentez le rapport d'audit. Ne corrigez rien. Ne mettez pas encore à jour `ui-registry.md`.

Demandez au développeur :

```
Audit terminé. [X] conflits trouvés sur [Y] propriétés.

Avant que j'établisse la base de référence dans ui-registry.md :
1. Les recommandations ci-dessus vous semblent-elles correctes ?
2. Y a-t-il des conflits que vous souhaitez résoudre différemment ?
3. Dois-je signaler les valeurs codées en dur comme des bugs à corriger ?

Confirmez la base de référence et je l'inscrirai dans ui-registry.md.

```

### Étape 4 — Écrire la base de référence confirmée

Après confirmation du développeur, inscrivez la base de référence convenue dans `ui-registry.md` pour servir de fondation. Identifiez-la clairement :

```markdown
## Base de référence — Établie le [date]

[Note : Cette base de référence a été établie via /imprint audit]

| Propriété               | Classe correcte |
| ----------------------- | --------------- |
| Arrière-plan de carte   | [classe]        |
| Bordure de carte        | [classe]        |
| Rayon de carte          | [classe]        |
| Bouton principal        | [classe]        |
| Bouton secondaire       | [classe]        |
| Texte principal         | [classe]        |
| Texte secondaire        | [classe]        |
| Texte atténué (muted)   | [classe]        |
| Arrière-plan d'un input | [classe]        |
| Bordure d'un input      | [classe]        |
```

### Étape 5 — Lister les éléments à corriger

Après avoir écrit la base de référence, générez une liste de correctifs — regroupant chaque composant qui s'en écarte :

```
## Composants à corriger

Ces composants s'écartent de la base de référence confirmée
et doivent être mis à jour :

- [Fichier du composant] — [ce qui ne va pas] → [ce que cela devrait être]
- [Fichier du composant] — [ce qui ne va pas] → [ce que cela devrait être]

```

## Le développeur peut désormais corriger ces éléments de manière systématique — ou au fur et à mesure qu'il intervient sur chaque composant. Dans tous les cas, la base de référence est établie et `/imprint` pourra être utilisé à l'avenir pour maintenir la cohérence des nouveaux composants.
