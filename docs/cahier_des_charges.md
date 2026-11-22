# NEXORA
## Cahier des charges fonctionnel et technique
**Version : 1.0 — Document de référence du projet**

**Nature du projet :** logiciel de gestion commerciale, financière et opérationnelle destiné à une seule entreprise par installation.

**Architecture :** application privée, avec serveur cloud et base de données PostgreSQL dédiés à chaque entreprise.

**Langue de l'interface :** français.

**Devise de référence :** FCFA (XAF ou XOF selon le pays et la configuration de l'entreprise).

**Plateformes visées :** Web, Windows et Android.

**Statut :** spécifications fonctionnelles et techniques de référence. Les fonctionnalités décrites ne sont pas toutes considérées comme développées, testées ou validées.

---

# 1. Présentation générale du projet

## 1.1 Contexte

Nexora est un logiciel de gestion conçu pour centraliser les activités administratives, commerciales, financières et opérationnelles d'une entreprise.

Il doit permettre à une entreprise de gérer ses clients, fournisseurs, produits, services, stocks, ventes, achats, paiements, dépenses, documents commerciaux et rapports depuis une interface unique.

L'objectif est de réduire les opérations manuelles, améliorer la fiabilité des données, faciliter le suivi financier et fournir au dirigeant une vision claire de l'activité.

## 1.2 Objectifs principaux

Nexora doit permettre de :

- Centraliser les informations de l'entreprise.
- Gérer les utilisateurs et leurs autorisations.
- Suivre les ventes et les encaissements.
- Gérer les paiements complets, partiels et différés.
- Contrôler les stocks et les mouvements.
- Gérer les achats et les fournisseurs.
- Administrer les abonnements et services numériques.
- Produire des devis, factures, bons de commande et avoirs.
- Suivre les dépenses et la trésorerie.
- Produire des rapports et statistiques.
- Sécuriser les données et les opérations.
- Effectuer des sauvegardes et restaurations.
- Faciliter l'utilisation sur plusieurs plateformes.

## 1.3 Périmètre organisationnel

Nexora est un logiciel mono-entreprise.

Chaque installation appartient à une seule entreprise. Elle possède :

- Son propre serveur cloud privé.
- Sa propre base PostgreSQL.
- Ses propres utilisateurs.
- Ses propres paramètres.
- Ses propres données commerciales.
- Ses propres documents.
- Ses propres sauvegardes.

Il n'est pas prévu, dans le périmètre initial, de faire cohabiter plusieurs entreprises indépendantes dans la même base de données.

---

# 2. Utilisateurs et rôles

## 2.1 Administrateur — ADMIN

L'administrateur dispose des droits les plus élevés.

Il peut notamment :

- Consulter les tableaux de bord.
- Gérer les utilisateurs.
- Attribuer les rôles et permissions.
- Gérer les clients et fournisseurs.
- Gérer les produits et services.
- Effectuer les opérations commerciales.
- Consulter les rapports financiers.
- Gérer les paramètres de l'entreprise.
- Consulter les journaux d'audit.
- Gérer les sauvegardes selon les autorisations techniques.
- Accéder aux données sensibles lorsque sa permission spécifique l'autorise.

La suppression ou la désactivation du dernier administrateur actif doit être empêchée.

## 2.2 Gestionnaire — MANAGER

Le gestionnaire assure le suivi des opérations quotidiennes.

Ses droits dépendent des permissions accordées par l'administrateur.

Il peut notamment gérer les ventes, achats, clients, fournisseurs, stocks et documents lorsque les permissions correspondantes sont accordées.

## 2.3 Employé — EMPLOYEE

L'employé utilise les fonctions nécessaires à son travail.

Il peut, selon ses permissions :

- Enregistrer des ventes.
- Consulter certains clients.
- Enregistrer des paiements.
- Consulter certains produits.
- Effectuer certaines opérations de stock.
- Consulter les documents autorisés.

Il ne doit pas accéder automatiquement aux paramètres sensibles, aux permissions ou aux informations financières confidentielles.

## 2.4 Permissions granulaires

Les permissions doivent être indépendantes des rôles.

Exemples :

- `DASHBOARD_READ`
- `CUSTOMERS_READ`
- `CUSTOMERS_CREATE`
- `CUSTOMERS_UPDATE`
- `SUPPLIERS_READ`
- `PRODUCTS_READ`
- `PRODUCTS_CREATE`
- `INVENTORY_READ`
- `INVENTORY_ADJUST`
- `SALES_READ`
- `SALES_CREATE`
- `SALES_CANCEL`
- `PAYMENTS_READ`
- `PAYMENTS_CREATE`
- `REFUNDS_CREATE`
- `PURCHASES_READ`
- `PURCHASES_CREATE`
- `EXPENSES_READ`
- `EXPENSES_CREATE`
- `QUOTES_READ`
- `QUOTES_CREATE`
- `DOCUMENTS_READ`
- `SUBSCRIPTIONS_READ`
- `SUBSCRIPTIONS_MANAGE`
- `SUBSCRIPTION_SECRETS_READ`
- `REPORTS_READ`
- `SETTINGS_MANAGE`
- `USERS_MANAGE`
- `AUDIT_READ`

Les permissions doivent être contrôlées côté serveur. Masquer un bouton dans l'interface ne constitue pas une protection suffisante.

---

# 3. Description fonctionnelle des modules

## 3.1 Authentification et gestion des sessions

Le système doit permettre :

- La connexion par identifiant et mot de passe.
- La déconnexion.
- La gestion des sessions.
- La révocation des sessions.
- La désactivation d'un utilisateur.
- La limitation des tentatives de connexion.
- La consultation des sessions actives selon les droits.
- La modification du mot de passe.
- La réinitialisation sécurisée du mot de passe.

Exigences :

- Hachage des mots de passe avec Argon2id.
- Sessions sécurisées.
- Cookies HttpOnly, Secure en production et SameSite adapté.
- Protection contre les attaques CSRF lorsque l'authentification par cookie l'exige.
- Aucun jeton de session sensible ne doit être exposé inutilement au JavaScript ou dans le JSON de connexion.
- Les connexions, déconnexions et révocations doivent être journalisées.

La réinitialisation du mot de passe devra prévoir un mécanisme sécurisé de vérification d'identité, avec expiration des liens ou codes.

## 3.2 Gestion des clients

Fonctionnalités :

- Créer un client.
- Modifier ses informations.
- Consulter sa fiche.
- Rechercher un client.
- Consulter son historique commercial.
- Consulter ses factures et paiements.
- Suivre son solde dû.
- Ajouter des notes.
- Désactiver un client sans supprimer son historique.

Informations possibles :

- Nom ou raison sociale.
- Téléphone.
- Adresse électronique.
- Adresse physique.
- Identifiant fiscal, si applicable.
- Notes internes.
- Date de création.

## 3.3 Gestion des fournisseurs

Fonctionnalités :

- Créer et modifier un fournisseur.
- Consulter ses coordonnées.
- Suivre les achats effectués.
- Consulter les commandes.
- Consulter les montants payés et dus.
- Ajouter des notes.
- Désactiver un fournisseur.

## 3.4 Gestion des produits et services

Chaque produit doit comporter, selon le cas :

- Référence.
- Nom.
- Description.
- Catégorie.
- Prix de vente.
- Prix d'achat.
- Quantité disponible.
- Seuil d'alerte.
- Unité de mesure.
- Code-barres éventuel.
- Statut actif ou inactif.

Les services doivent pouvoir être enregistrés sans quantité physique en stock.

Le système doit empêcher la vente d'un produit inactif.

Les prix historiques des ventes doivent être conservés : modifier le prix d'un produit ne doit pas réécrire les anciennes ventes.

## 3.5 Gestion des stocks

Fonctionnalités :

- Consultation du stock.
- Entrées.
- Sorties.
- Ajustements.
- Historique des mouvements.
- Alertes de stock faible.
- Réception des achats.
- Déduction du stock lors des ventes.
- Annulation contrôlée d'opérations.

Chaque mouvement doit préciser :

- Le produit concerné.
- La quantité.
- Le type de mouvement.
- La date.
- L'utilisateur responsable.
- La raison.
- La référence de l'opération d'origine.

Les quantités doivent être protégées contre les modifications concurrentes.

Un ajustement manuel doit nécessiter une permission appropriée et une justification.

## 3.6 Gestion des ventes

Une vente doit pouvoir contenir plusieurs lignes.

Chaque ligne comporte :

- Un produit ou service.
- Une quantité.
- Un prix unitaire.
- Une remise éventuelle.
- Un montant total.

La vente doit enregistrer :

- Un numéro unique.
- Le client.
- Les lignes.
- Le montant HT.
- Les taxes.
- Le montant TTC.
- Le montant payé.
- Le solde restant.
- Le statut.
- La date.
- L'utilisateur créateur.

Statuts possibles :

- BROUILLON.
- CONFIRMÉE.
- PARTIELLEMENT_PAYÉE.
- PAYÉE.
- ANNULÉE.

Les statuts définitifs seront harmonisés avec le schéma de données réel.

Une vente confirmée doit enregistrer une photographie des prix et informations nécessaires à la conservation de l'historique.

## 3.7 Paiements

Le système doit accepter :

- Paiement intégral.
- Paiement partiel.
- Paiement différé.
- Paiement en espèces.
- Virement bancaire.
- Carte bancaire.
- Mobile Money.
- Autres moyens configurables.

Chaque paiement comporte :

- Une référence unique.
- Une vente associée.
- Un montant.
- Une méthode.
- Une date.
- Un utilisateur responsable.
- Une référence externe éventuelle.

Les paiements multiples doivent être possibles pour une même vente.

Le système doit empêcher :

- Un paiement nul ou négatif.
- Un double encaissement provoqué par une requête répétée.
- Un paiement supérieur au solde restant, sauf mécanisme explicite d'avance ou de crédit.
- La modification silencieuse d'un paiement déjà comptabilisé.

Les corrections financières doivent passer par des opérations traçables.

## 3.8 Remboursements et annulations

Fonctionnalités :

- Remboursement total.
- Remboursement partiel.
- Motif obligatoire.
- Historique des remboursements.
- Génération d'un avoir lorsque cela est nécessaire.
- Annulation contrôlée d'une vente.

Un remboursement doit être plafonné au montant remboursable restant.

Le stock ne doit être réintégré que selon la nature du retour et l'état des produits.

Un remboursement ne doit pas être assimilé à une simple suppression de paiement.

## 3.9 Services et abonnements numériques

Ce module permet de gérer les services numériques vendus ou administrés par l'entreprise.

Fonctionnalités :

- Création d'un service numérique.
- Gestion de comptes ou profils.
- Affectation à un client.
- Dates de début et de fin.
- Renouvellement.
- Historique des affectations.
- Annulation administrative.
- Suivi des disponibilités.

Les identifiants sensibles doivent être chiffrés avec AES-256-GCM.

La permission de consulter les abonnements doit être distincte de celle permettant de déchiffrer les identifiants secrets.

Le renouvellement d'un abonnement ne doit pas créer automatiquement une vente ou un encaissement sans règle métier explicitement activée.

## 3.10 Gestion des achats

Fonctionnalités :

- Créer un achat.
- Ajouter plusieurs produits.
- Enregistrer les quantités et prix.
- Associer un fournisseur.
- Enregistrer le statut de la commande.
- Réceptionner les produits.
- Consulter l'historique.

La réception doit mettre à jour le stock dans une transaction atomique.

Une réception déjà effectuée ne doit pas pouvoir être répétée par erreur.

Les achats et les dépenses doivent rester deux notions distinctes : l'achat de marchandises n'est pas automatiquement une dépense opérationnelle.

## 3.11 Gestion des dépenses

Le système doit permettre :

- L'enregistrement d'une dépense.
- Le choix d'une catégorie.
- L'indication du montant.
- Le mode de paiement.
- La date.
- La description.
- L'ajout éventuel d'une pièce justificative.

Les dépenses doivent être intégrées aux rapports financiers selon leur date et leur statut.

## 3.12 Devis

Fonctionnalités :

- Création d'un devis.
- Plusieurs lignes.
- Calcul des taxes et remises.
- Date de validité.
- Export PDF.
- Consultation.
- Conversion en vente.
- Refus ou expiration.

La conversion en vente doit être atomique afin d'empêcher la création de deux ventes à partir du même devis.

## 3.13 Bons de commande

Fonctionnalités :

- Création de commandes fournisseurs.
- Plusieurs lignes.
- Référence unique.
- Statut.
- PDF.
- Réception totale ou partielle selon les règles retenues.
- Historique des réceptions.

Une réception doit être protégée contre les doubles traitements.

## 3.14 Avoirs

Fonctionnalités :

- Création depuis un remboursement ou une opération autorisée.
- Numérotation unique.
- Association à la vente d'origine.
- Montant.
- Motif.
- PDF.
- Historique.

Un remboursement ne doit pas créer plusieurs avoirs identiques.

## 3.15 Clôtures mensuelles

Le système doit permettre la clôture d'une période mensuelle.

Données à conserver :

- Chiffre d'affaires.
- Encaissements.
- Remboursements.
- Dépenses.
- Achats.
- Solde des créances clients.
- Indicateurs de marge selon les données disponibles.

Les définitions comptables doivent être explicites.

Le chiffre d'affaires, les encaissements et la trésorerie ne doivent jamais être confondus.

Une clôture doit conserver un instantané des valeurs et les paramètres de calcul utilisés.

Toute réouverture doit être réservée à une permission spécifique et être journalisée.

## 3.16 Paramètres de l'entreprise

Le système doit permettre de configurer :

- Nom commercial.
- Raison sociale.
- Logo.
- Coordonnées.
- Adresse.
- Devise.
- Fuseau horaire.
- Langue.
- Taxes et TVA.
- Numérotation des documents.
- Moyens de paiement.
- Mentions légales.
- Modèles PDF.

Les modifications doivent être réservées aux utilisateurs autorisés.

## 3.17 Notifications

Le système doit prévoir un centre de notifications.

Événements possibles :

- Stock faible.
- Paiement reçu.
- Paiement en retard.
- Nouvelle vente.
- Remboursement.
- Fin prochaine d'un abonnement.
- Commande à réceptionner.
- Connexion inhabituelle.
- Modification de paramètres sensibles.

Les notifications doivent être consultables, marquées comme lues et filtrables.

Les canaux futurs pourront inclure les notifications internes, e-mail et notifications mobiles.

Les envois doivent gérer les erreurs et éviter les doublons.

## 3.18 Rapports et tableau de bord

Le tableau de bord doit afficher selon les permissions :

- Chiffre d'affaires.
- Nombre de ventes.
- Encaissements.
- Remboursements.
- Dépenses.
- Achats.
- Solde des créances.
- Produits les plus vendus.
- Stock faible.
- Activité récente.

Rapports :

- Ventes par période.
- Ventes par produit.
- Ventes par client.
- Marges.
- Achats.
- Dépenses.
- Fournisseurs.
- Trésorerie.
- Abonnements.
- Stocks.

Les exports PDF et Excel sont prévus.

## 3.19 Journaux d'audit

Le système doit enregistrer les actions sensibles :

- Connexions.
- Création et désactivation d'utilisateurs.
- Modification des permissions.
- Modifications financières.
- Remboursements.
- Annulations.
- Ajustements de stock.
- Accès aux identifiants secrets.
- Modifications des paramètres.
- Opérations de clôture.

Un journal doit contenir au minimum l'utilisateur, l'action, la date, le résultat et le contexte nécessaire à l'investigation.

Les journaux ne doivent pas contenir de mots de passe, jetons de session ou identifiants secrets en clair.

---

# 4. Règles de gestion essentielles

1. Une entreprise correspond à une installation Nexora et à une base PostgreSQL dédiée.
2. Chaque utilisateur doit être authentifié et autorisé avant toute opération protégée.
3. Les permissions sont contrôlées sur le backend.
4. Chaque document commercial possède une référence unique.
5. Les opérations financières doivent être traçables.
6. Les paiements ne doivent pas être dupliqués.
7. Les remboursements ne peuvent pas dépasser le montant remboursable.
8. Les ventes de produits doivent respecter les règles de stock.
9. Les réceptions d'achat doivent mettre à jour le stock de manière atomique.
10. Les devis ne peuvent être convertis qu'une seule fois en vente.
11. Les avoirs ne peuvent être générés en double pour une même opération.
12. Les données historiques ne doivent pas être réécrites lorsque les prix ou paramètres changent.
13. Les suppressions d'éléments utilisés dans des opérations historiques doivent être remplacées par une désactivation ou une procédure d'annulation.
14. Les clôtures mensuelles doivent être reproductibles et auditables.
15. Les secrets numériques doivent être chiffrés et leur déchiffrement soumis à une permission dédiée.
16. Les modifications critiques doivent être effectuées dans des transactions de base de données.
17. Les actions critiques doivent être protégées contre les requêtes concurrentes.
18. Les numérotations doivent être générées sans collision.

---

# 5. Exigences non fonctionnelles

## 5.1 Sécurité

- HTTPS obligatoire en production.
- Argon2id pour les mots de passe.
- AES-256-GCM pour les secrets numériques.
- Cookies de session sécurisés.
- Protection contre les attaques CSRF, XSS et injections SQL.
- Validation des entrées côté serveur.
- Limitation des tentatives de connexion.
- Gestion des permissions.
- Journalisation des actions sensibles.
- Rotation des secrets et procédure de renouvellement des clés.
- Protection des sauvegardes.
- Aucun secret dans le dépôt Git.

## 5.2 Performance

Objectifs à valider par des tests :

- Réponses usuelles de l'API inférieures à 500 ms au 95e percentile dans l'environnement cible.
- Pagination des listes volumineuses.
- Indexation des colonnes utilisées dans les recherches.
- Traitement asynchrone des tâches longues.
- Génération PDF sans bloquer les autres requêtes.

Ces valeurs constituent des objectifs, pas des performances déjà mesurées.

## 5.3 Disponibilité

Le serveur devra être surveillé.

Les procédures devront couvrir :

- Panne de l'application.
- Panne de PostgreSQL.
- Perte de connexion.
- Saturation du disque.
- Échec d'une sauvegarde.
- Échec d'une mise à jour.

## 5.4 Sauvegardes

Prévoir :

- Sauvegardes automatiques.
- Sauvegardes manuelles.
- Conservation selon une politique définie.
- Chiffrement des sauvegardes si nécessaire.
- Vérification de l'intégrité.
- Tests de restauration.
- Procédure documentée de reprise.

Une sauvegarde n'est considérée fiable qu'après vérification et test de restauration.

## 5.5 Compatibilité

- Navigateurs modernes.
- Windows 10/11, sous réserve de compatibilité des dépendances retenues.
- Android, après validation de la configuration native Tauri.
- Interface responsive.
- Utilisation adaptée aux écrans mobiles et ordinateurs.

---

# 6. Architecture technique

## 6.1 Stack retenue

| Couche | Technologie |
|---|---|
| Frontend | React |
| Langage frontend | TypeScript |
| Bundler | Vite |
| Styles | Tailwind CSS |
| Backend | Node.js |
| API | Express |
| Langage backend | TypeScript |
| ORM | Prisma |
| Base de données | PostgreSQL |
| Authentification | Argon2id et sessions sécurisées |
| PDF | Génération côté serveur |
| Application Windows/Android | Tauri 2 |
| Gestionnaire de paquets | npm workspaces |
| Tests | Vitest, Supertest et Playwright |

## 6.2 Architecture générale

Le frontend communique avec l'API Express via HTTPS.

L'API valide les demandes, vérifie les permissions et exécute les opérations via Prisma.

PostgreSQL conserve les données.

Les documents PDF sont générés côté serveur.

Les tâches planifiées gèrent notamment les notifications, les alertes et les opérations récurrentes.

## 6.3 Structure cible du dépôt

```text
nexora/
├── apps/
│   ├── backend/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   ├── middleware/
│   │   │   ├── services/
│   │   │   ├── routes/
│   │   │   └── server.ts
│   │   └── tests/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── features/
│   │   │   ├── hooks/
│   │   │   └── services/
│   │   └── public/
│   └── desktop/
│       └── src-tauri/
├── packages/
│   └── shared-types/
├── docs/
├── scripts/
├── .env.example
├── package.json
└── README.md
```

Cette arborescence est une cible de consolidation. Elle devra être comparée à l'arborescence réelle avant toute modification.

## 6.4 Base de données

PostgreSQL est la source de vérité.

Prisma gère les modèles et migrations.

La chaîne de migrations doit permettre :

- L'installation d'une base vide.
- La mise à jour d'une base existante.
- Le suivi des migrations appliquées.
- La restauration après incident.
- La vérification de cohérence entre le schéma Prisma et la structure SQL.

La migration initiale doit précéder les migrations des phases 5 à 9.

---

# 7. API et services

Les routes API seront organisées par domaine métier.

Exemples de préprefixes :

```text
/api/v1/auth
/api/v1/users
/api/v1/permissions
/api/v1/customers
/api/v1/suppliers
/api/v1/products
/api/v1/inventory
/api/v1/sales
/api/v1/payments
/api/v1/refunds
/api/v1/purchases
/api/v1/expenses
/api/v1/quotes
/api/v1/purchase-orders
/api/v1/credit-notes
/api/v1/subscriptions
/api/v1/notifications
/api/v1/reports
/api/v1/dashboard
/api/v1/settings
/api/v1/audit
```

Chaque route doit avoir :

- Une validation des paramètres.
- Une authentification lorsqu'elle est nécessaire.
- Une vérification de permission.
- Une gestion cohérente des erreurs.
- Une documentation.
- Des tests.

Les routes de documents doivent appliquer les permissions du document concerné et ne pas se contenter de vérifier qu'un utilisateur est connecté.

---

# 8. Phasage du développement

| Phase | Livrable attendu | État |
|---|---|---|
| 1 à 4 | Socle applicatif et modules fondamentaux | Archives existantes, à auditer |
| 5 | Achats, dépenses, devis et stock | Archive existante |
| 6 | Services et abonnements numériques | Archive existante |
| 7 | Documents, avoirs et clôtures | Archive existante |
| 8 | Sécurité, sessions et sauvegardes | Archive existante |
| 9 | Utilisateurs et permissions | Archive existante |
| 10 | Paramètres de l'entreprise | À développer |
| 11 | Notifications | À développer |
| 12 | Rapports avancés | À développer |
| 13 | Tests et validation | À réaliser |
| 14 | Consolidation et correction du monorepo | À réaliser |
| 15 | Installation Web, Windows, Android et VPS | À réaliser |
| 16 | Maintenance, monitoring et mises à jour | À réaliser |

Les phases 1 à 9 existent sous forme d'archives ZIP, mais leur présence ne constitue pas une preuve de fonctionnement complet.

---

# 15. Livrables finaux attendus

La livraison complète devra inclure :

1. Code source consolidé.
2. Monorepo npm fonctionnel.
3. Schéma Prisma définitif.
4. Migrations SQL complètes.
5. API documentée.
6. Interface React.
7. Application Windows.
8. Application Android si validée.
9. Scripts d'installation.
10. Scripts de sauvegarde et restauration.
11. Documentation technique.
12. Guide utilisateur.
13. Guide administrateur.
14. Fichier `.env.example`.
15. Tests automatisés.
16. Procédure de mise à jour.
17. Procédure de retour à une version précédente.
18. Archive ZIP finale du projet.

Les fichiers de configuration ne devront contenir aucun secret réel.

---

# 16. Risques et points de vigilance

| Risque | Mesure prévue |
|---|---|
| Migrations incomplètes | Reconstruire la migration initiale et vérifier la chaîne complète |
| Accès excessifs | Vérifier toutes les permissions côté serveur |
| Double encaissement | Idempotence et transactions |
| Erreurs de stock | Verrouillage et transactions |
| Perte de données | Sauvegardes et tests de restauration |
| Exposition des secrets numériques | Chiffrement et permission spécifique |
| Conflits concurrents | Contraintes SQL et transactions adaptées |
| Mauvais calculs financiers | Définitions métier et tests automatisés |
| Mise à jour défaillante | Sauvegarde préalable et rollback documenté |
| Incompatibilité native | Tests de compilation Windows et Android |

---

# 17. Conclusion et décision de référence

Nexora doit devenir un logiciel de gestion commerciale et opérationnelle complet, sécurisé, modulaire et maintenable.

L'architecture retenue est une application React/TypeScript, un backend Node.js/Express, une base PostgreSQL gérée avec Prisma, et une enveloppe native Tauri 2 pour les plateformes compatibles.

Le développement devra privilégier la fiabilité des opérations financières, la sécurité des accès, la cohérence de la base de données et la traçabilité des actions.

**La priorité immédiate est la consolidation technique des phases 1 à 9**, avant l'ajout des nouveaux modules. La migration initiale, les migrations intermédiaires, les permissions PDF, les sessions, les transactions financières et les tests doivent être traités en premier.

Ce document constitue la référence fonctionnelle et technique à utiliser pour les prochaines étapes de conception, de développement, de tests et de livraison de Nexora.
