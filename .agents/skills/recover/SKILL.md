,Voici la traduction en français de ce second document, respectant rigoureusement le formatage Markdown et la structure d'origine.

---

---

## name: recover

description: Lorsque quelque chose tourne mal pendant un build, diagnostiquez le type de défaillance avant de décider comment réagir. Correction ciblée, réinitialisation complète (hard reset) ou refonte totale — la bonne réponse dépend du bon diagnostic.

Tous les problèmes ne sont pas des bugs. Et tous les bugs ne nécessitent pas un débogage.

Lorsque les choses se passent mal dans le cadre du développement assisté par IA, le premier réflexe est de continuer à envoyer des prompts : décrire le problème, demander un correctif, obtenir une nouvelle version qui ne marche pas, décrire ce nouveau problème, demander un autre correctif. La session s'éternise. Le contexte se pollue. Le code se détériore.

Le problème ne vient pas du code. Le problème vient du fait que vous ne savez pas à quel type de défaillance vous faites face.

Cette compétence diagnostique d'abord la défaillance. Ensuite, elle prescrit la bonne réponse. Ce sont deux étapes distinctes qui ne peuvent pas être inversées.

---

## Étape 1 — Décrire ce qui a échoué

Le développeur décrit le problème. La compétence écoute avant de faire quoi que ce soit d'autre.

Demandez :

```
Décrivez ce qui ne va pas. Soyez précis :
- Qu'est-ce qui était censé se passer ?
- Que s'est-il passé à la place ?
- Combien de fois avez-vous déjà essayé de corriger cela ?

```

Lisez attentivement la réponse. Le nombre de tentatives de correction est crucial : il vous indique s'il s'agit d'un problème récent ou d'une session qui a déjà déraillé.

---

## Étape 2 — Identifier le mode de défaillance

En vous basant sur la description, déterminez lequel de ces trois modes de défaillance correspond à la situation.

### Mode de défaillance 1 — Un élément spécifique est cassé

**Signes :**

- Le problème est isolé — un seul composant, une seule fonction, une seule route.
- Le reste du projet fonctionne correctement.
- Il s'agit de la première ou de la deuxième tentative de correction.
- Le message d'erreur ou le comportement incorrect est clair et précis.

**Ce que cela signifie :**
C'est un bug normal. Il possède une cause racine qui peut être identifiée et corrigée avec précision.

**Réponse :** Correction ciblée — passez à l'Étape 3A.

---

### Mode de défaillance 2 — La session a déraillé

**Signes :**

- Les multiples tentatives de correction ont aggravé les choses ou créé de nouveaux problèmes.
- Le code est devenu un sac de nœuds — les correctifs ne font que colmater d'autres correctifs.
- Le contexte de la session est saturé de tentatives infructueuses.
- Le problème d'origine n'est même plus clair.

**Ce que cela signifie :**
Le contexte de la session est pollué. Envoyer d'autres prompts n'aidera pas — cela ne fera qu'aggraver les dégâts. La fonctionnalité doit être reconstruite dans un contexte propre, et non pas patchée indéfiniment.

**Réponse :** Réinitialisation complète (Hard reset) — passez à l'Étape 3B.

---

### Mode de défaillance 3 — Les fondations sont erronées

**Signes :**

- Le code s'exécute mais produit un comportement fondamentalement incorrect.
- Claude a construit avec assurance quelque chose qui repose sur une mauvaise compréhension d'une exigence clé, d'une API de bibliothèque ou d'un pattern architectural.
- Le problème n'est pas un bug dans l'implémentation — c'est l'implémentation elle-même qui est mauvaise.
- Corriger des éléments isolés ne servira à rien car l'approche globale est incorrecte.

**Ce que cela signifie :**
Il ne s'agit pas d'un problème de débogage. L'approche doit être reconsidérée avant d'écrire la moindre ligne de code. Continuer à implémenter dans la mauvaise direction rendra le tout encore plus difficile à démêler.

**Réponse :** Refonte totale (Rethink) — passez à l'Étape 3C.

---

Annoncez au développeur le mode de défaillance identifié avant de continuer :

```
Cela ressemble au Mode de défaillance [1/2/3] — [nom].

[Une phrase expliquant pourquoi vous l'avez identifié ainsi.]

Voici comment nous allons procéder :

```

---

## Étape 3A — Correction ciblée

Pour le Mode de défaillance 1.

### Diagnostiquer avant de toucher au code

Demandez au développeur de partager :

- Le message d'erreur exact ou le comportement incorrect.
- Le fichier ou la fonction spécifique où cela se produit.
- Ce que le code est censé faire par rapport à ce qu'il fait réellement.

Lisez le code concerné. Ne lisez pas l'intégralité de la base de code — seulement ce qui est directement lié au problème.

### Trouver la cause racine

Identifiez la cause racine avant de suggérer le moindre correctif. La cause racine est la raison réelle pour laquelle le problème existe — pas un simple symptôme.

Énoncez clairement la cause racine :

```
Cause racine : [explication spécifique de la raison pour laquelle cela se produit]

C'est différent du symptôme car : [explication]

```

### Suggérer un correctif précis

Décrivez le correctif qui traite la cause racine. Pas une solution de contournement (workaround). Pas un patch par-dessus du code cassé.

```
Correctif : [ce qui doit changer et pourquoi]

Cela résoudra la cause racine car : [explication]

```

Attendez que le développeur confirme avant d'effectuer des modifications.

### Si le correctif ne fonctionne pas

Si le correctif suggéré ne résout pas le problème : arrêtez-vous. Ne proposez pas immédiatement un autre correctif.

Réexaminez le diagnostic de la cause racine. Si le correctif n'a pas fonctionné, c'est que le diagnostic initial était probablement erroné. Diagnostiquez à nouveau depuis le début avant de faire une nouvelle tentative.

Si deux diagnostics de cause racine successifs se révèlent faux, il se peut que vous soyez en réalité face au Mode de défaillance 2 ou 3. Réévaluez la situation.

---

## Étape 3B — Réinitialisation complète (Hard Reset)

Pour le Mode de défaillance 2.

### Reconnaître la situation honnêtement

```
Cette session est allée trop loin dans la mauvaise direction
pour être sauvée par des patchs. La bonne décision est de repartir sur de bases saines.

Ce n'est pas un échec — c'est la réponse appropriée
à un contexte pollué. Une nouvelle session avec une intention claire
sera plus rapide que de s'obstiner ici.

```

### Sauvegarder ce qui mérite de l'être

Avant de mettre fin à la session, extrayez tout ce qui a de la valeur dans l'état actuel :

- Qu'est-ce que la fonctionnalité d'origine était censée faire ?
- Quelles parties de l'implémentation actuelle sont, le cas échéant, correctes ?
- Qu'avez-vous appris sur ce qui ne fonctionne pas ?
- Qu'est-ce que la prochaine session devrait éviter ?

Rédigez cela sous la forme d'une brève note de réinitialisation :

```
## Note de réinitialisation — [Nom de la fonctionnalité]

### Ce que nous construisions
[Description de la fonctionnalité d'origine]

### Ce qui a mal tourné
[Résumé honnête de la manière dont la session a déraillé]

### Ce qu'il faut éviter la prochaine fois
[Approches ou patterns spécifiques qui n'ont pas fonctionné]

### Point de départ pour la prochaine session
[Par où recommencer à neuf — ce qu'il faut garder, ce qu'il faut jeter]

```

### Instructions pour le développeur

```
Prochaines étapes :

1. Enregistrez cette note de réinitialisation dans un endroit accessible.
2. Fermez complètement cette session.
3. Ouvrez une toute nouvelle session.
4. Commencez par /remember restore si une mémoire existe.
5. Abordez à nouveau [nom de la fonctionnalité] en utilisant la note de réinitialisation comme contexte.

Ne continuez pas dans cette session.

```

---

## Étape 3C — Refonte totale (Rethink)

Pour le Mode de défaillance 3.

### Nommer la fausse hypothèse

Si les fondations sont mauvaises, c'est que quelque chose a été tenu pour vrai alors que ce n'était pas le cas. Trouvez de quoi il s'agit.

```
Le problème de fond n'est pas un bug — c'est une fausse hypothèse :

Hypothèse de départ : [ce qui a été supposé]
Réalité : [ce qui est réellement vrai]

Cela signifie que l'implémentation actuelle ne peut pas être corrigée
par des patchs. L'approche doit changer.

```

### Proposer la bonne approche

En vous basant sur une compréhension correcte, décrivez ce qu'aurait dû être l'approche :

```
Approche correcte : [description]

Différence clé par rapport à l'approche actuelle : [explication]

Ce qui doit être abandonné : [ce qui ne peut pas être sauvé]
Ce qui peut être conservé : [ce qui reste valide]

```

### Ne pas recommencer à coder immédiatement

Une refonte totale exige que le développeur comprenne et valide la nouvelle direction avant toute modification du code. Présentez l'analyse et attendez la confirmation.

```
Ce diagnostic correspond-il à votre analyse ?

Si oui — nous pouvons repartir sur de bases saines avec la bonne approche.
Si non — dites-moi là où je me trompe.

```

La reconstruction ne commence qu'après la confirmation explicite du développeur.

---

## Le Principe

La pire chose à faire lorsque quelque chose est cassé, c'est de continuer à faire exactement la même chose, mais plus vite.

## Diagnostiquez d'abord. Réagissez correctement. Des défaillances différentes exigent des réponses différentes — et savoir à quelle défaillance vous faites face représente déjà plus de la moitié de la solution.
