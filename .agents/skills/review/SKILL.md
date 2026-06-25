Voici la traduction en français, en conservant précieusement le formatage d'origine :

---

## name: review

description: Après avoir développé une fonctionnalité, vérifiez qu'elle correspond à ce qui était prévu, qu'elle respecte l'architecture du système ainsi que les normes de design, et qu'elle est prête pour la production. Signalez les problèmes clairement afin que le développeur décide de ce qu'il faut corriger.

Le développement n'est pas terminé lorsque le code s'exécute. Il est terminé lorsque le code est correct.

L'IA évolue vite. Et cette rapidité fait que l'on construit parfois des choses qui fonctionnent en surface, mais qui s'éloignent de l'architecture, violent le système de design ou omettent des cas limites importants. Cette compétence permet de détecter ces dérives avant qu'elles ne se transforment en problèmes plus graves.

Exécutez cette routine après chaque fonctionnalité. Avant de passer à la suite.

## Ce que cette compétence ne fait pas

Elle ne corrige rien. Elle signale ce qu'elle trouve et laisse le développeur décider de ce qui est important et de la marche à suivre. Corriger sans comprendre est le meilleur moyen d'enterrer les problèmes au lieu de les résoudre.

---

## Étape 1 — Comprendre ce qui aurait dû être construit

Avant d'analyser quoi que ce soit, établissez la référence.

Lisez dans cet ordre :

- Le plan d'implémentation provenant de `/architect`, s'il en existe un.
- La description de la fonctionnalité ou la tâche qui a été assignée.
- Tout fichier de contexte pertinent — limites architecturales, normes de code, règles de design.

Si aucun plan n'existe, demandez au développeur de décrire ce que la fonctionnalité était censée faire avant de commencer l'examen. Vous ne pouvez pas vérifier la conformité sans savoir à quoi ressemble un résultat correct.

---

## Étape 2 — Analyser sur trois niveaux

### Niveau 1 — Est-ce conforme au plan ?

Comparez ce qui a été construit avec ce qui était prévu.

Vérifiez :

- Chaque élément de la description de la fonctionnalité — tout y est-il ?
- Les décisions prises lors de la planification — se reflètent-elles dans le code ?
- Le périmètre — l'implémentation est-elle restée dans les clous ou a-t-elle ajouté des éléments non demandés ?

Signalez tout ce qui était prévu mais qui est manquant. Signalez tout ce qui a été construit mais qui n'était pas prévu.

### Niveau 2 — Est-ce que cela respecte le système ?

C'est ici que les dérives liées à l'IA se produisent le plus souvent. La fonctionnalité marche, mais elle viole des règles essentielles au projet.

Vérifiez :

- **Limites architecturales** — le code situé au bon endroit assume-t-il les bonnes responsabilités ? Pas de logique d'interface (UI) dans les routes d'API. Pas d'appels à la base de données dans les composants. Quelles que soient les frontières du projet — sont-elles respectées ?
- **Système de design (Design System)** — les bons jetons (tokens), classes et patterns sont-ils utilisés ? Y a-t-il des valeurs codées en dur qui devraient être des variables ? Des classes de couleur brutes qui devraient utiliser le système de design ?
- **Normes de code** — conventions de nommage, organisation des fichiers, rigueur TypeScript, gestion des erreurs — correspondent-elles à ce qui a été établi pour le projet ?
- **Patterns existants** — cette fonctionnalité introduit-elle une nouvelle approche alors qu'un modèle existant aurait dû être utilisé ?

### Niveau 3 — Est-ce prêt pour la production ?

Vérifiez :

- La gestion des erreurs — que se passe-t-il quand les choses tournent mal ? Les erreurs sont-elles capturées et gérées, ou la fonctionnalité échoue-t-elle en silence ?
- Les cas limites (edge cases) — états vides (empty states), états de chargement, données manquantes — sont-ils gérés ?
- Les erreurs de console — y a-t-il des erreurs ou des avertissements dans le navigateur ou le terminal ?
- Les bugs évidents — tout ce qui bloquerait manifestement un utilisateur réel.

---

## Étape 3 — Communiquer les résultats

Après avoir passé en revue les trois niveaux, générez un rapport clair. N'enterrez pas les problèmes. Ne les édulcorez pas. Rapportez les faits honnêtement pour que le développeur puisse prendre des décisions éclairées.

```
## Analyse — [Nom de la fonctionnalité]

### Niveau 1 — Alignement avec le plan
[CONFORME / PROBLÈMES DÉTECTÉS]
[Listez les écarts entre ce qui était prévu et ce qui a été construit]

### Niveau 2 — Intégrité du système
[CONFORME / PROBLÈMES DÉTECTÉS]
[Listez toute violation de l'architecture, du système de design ou des normes de code]

### Niveau 3 — Prêt pour la production
[CONFORME / PROBLÈMES DÉTECTÉS]
[Listez les lacunes dans la gestion des erreurs, les cas limites ou les bugs évidents]

### Résumé
[X] problèmes trouvés sur [Y] niveaux.

[Si aucun problème : "Aucun problème détecté. Cette fonctionnalité est prête à être déployée."]
[Si des problèmes existent : "Résolvez les points ci-dessus avant de passer à la fonctionnalité suivante."]

```

---

## Étape 4 — Laisser le développeur décider

Après avoir présenté le rapport, arrêtez-vous. Ne commencez pas à corriger. Ne suggérez pas de correctifs à moins que le développeur ne le demande.

Attendez que le développeur :

- Vous demande de corriger un problème spécifique.
- Vous indique qu'un problème est intentionnel et peut être ignoré.
- Confirme que tout est résolu et prêt pour la suite.

C'est le développeur qui est maître de la décision qualité. Votre rôle est de l'éclairer.

---

## Guide de sévérité

Tous les problèmes ne se valent pas. Utilisez ce guide pour aider le développeur à prioriser :

**Critique — à corriger avant de continuer**

- Violations des limites architecturales qui bloqueront les futures fonctionnalités.
- Absence de gestion des erreurs provoquant des échecs silencieux.
- Fonctionnalité prévue mais totalement manquante.

**Important — à corriger rapidement**

- Dérive par rapport au système de design qui entraînera des incohérences visuelles.
- Violations des normes de code qui vont se propager et s'aggraver dans le projet.
- Cas limites qu'un utilisateur réel est susceptible de rencontrer.

**Mineur — à corriger dès que possible**

- Incohérences de nommage qui n'affectent pas le comportement.
- Optimisations manquantes.
- Problèmes de style qui n'impactent pas le système de design.

Attribuez un niveau de sévérité à chaque problème pour que le développeur puisse faire son tri rapidement.

---

## La Norme

La question à laquelle répond cette compétence n'est pas : « Est-ce que ça marche ? »

La question est : « Est-ce que c'est correct ? »

Fonctionnel et correct sont deux choses bien distinctes. Une fonctionnalité peut marcher aujourd'hui et casser le projet demain. L'analyse est là pour faire la différence.
