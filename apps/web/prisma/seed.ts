import { PrismaClient, UserRole, ItemType, SaleStatus } from '@prisma/client';
import { hashPassword, encryptSecret } from '../src/lib/crypto';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [SEED] Démarrage du peuplement initial de la base PostgreSQL nexora...');

  // 1. Paramètres Entreprise
  const settings = await prisma.companySettings.upsert({
    where: { id: 'default-company-settings' },
    update: {},
    create: {
      id: 'default-company-settings',
      businessName: 'Entreprise Demo',
      legalName: 'Entreprise Demo SARL',
      currency: 'FCFA',
      timezone: 'Africa/Dakar',
      language: 'fr',
      defaultVatRate: 18.0,
      businessType: 'HYBRID',
      enableInventory: true,
      enableDigitalSubs: true,
      enablePurchases: true,
      enableQuotes: true,
    },
  });
  console.log(`✅ [SEED] Paramètres de l'entreprise configurés (${settings.businessName} - ${settings.currency})`);

  // 2. Permissions granulaires (CDC Section 2.4)
  const permissionsList = [
    { code: 'DASHBOARD_READ', description: 'Consulter le tableau de bord', category: 'COMMERCE' },
    { code: 'CUSTOMERS_READ', description: 'Consulter les fiches clients', category: 'COMMERCE' },
    { code: 'CUSTOMERS_CREATE', description: 'Créer de nouveaux clients', category: 'COMMERCE' },
    { code: 'CUSTOMERS_UPDATE', description: 'Modifier les informations clients', category: 'COMMERCE' },
    { code: 'SUPPLIERS_READ', description: 'Consulter les fournisseurs', category: 'COMMERCE' },
    { code: 'SUPPLIERS_CREATE', description: 'Créer des fournisseurs', category: 'COMMERCE' },
    { code: 'PRODUCTS_READ', description: 'Consulter le catalogue produits', category: 'COMMERCE' },
    { code: 'PRODUCTS_CREATE', description: 'Ajouter des produits au catalogue', category: 'COMMERCE' },
    { code: 'INVENTORY_READ', description: 'Consulter les stocks et alertes', category: 'STOCKS' },
    { code: 'INVENTORY_ADJUST', description: 'Effectuer des ajustements de stock', category: 'STOCKS' },
    { code: 'SALES_READ', description: 'Consulter les ventes et factures', category: 'COMMERCE' },
    { code: 'SALES_CREATE', description: 'Créer des ventes et factures', category: 'COMMERCE' },
    { code: 'SALES_CANCEL', description: 'Annuler des ventes', category: 'COMMERCE' },
    { code: 'PAYMENTS_READ', description: 'Consulter les paiements', category: 'FINANCE' },
    { code: 'PAYMENTS_CREATE', description: 'Enregistrer des encaissements', category: 'FINANCE' },
    { code: 'REFUNDS_CREATE', description: 'Effectuer des remboursements', category: 'FINANCE' },
    { code: 'PURCHASES_READ', description: 'Consulter les achats fournisseurs', category: 'COMMERCE' },
    { code: 'PURCHASES_CREATE', description: 'Créer des commandes d’achat', category: 'COMMERCE' },
    { code: 'PURCHASES_RECEIVE', description: 'Réceptionner des marchandises en stock', category: 'STOCKS' },
    { code: 'EXPENSES_READ', description: 'Consulter les dépenses', category: 'FINANCE' },
    { code: 'EXPENSES_CREATE', description: 'Enregistrer des dépenses', category: 'FINANCE' },
    { code: 'QUOTES_READ', description: 'Consulter les devis', category: 'COMMERCE' },
    { code: 'QUOTES_CREATE', description: 'Créer des devis', category: 'COMMERCE' },
    { code: 'QUOTES_CONVERT', description: 'Convertir un devis en vente', category: 'COMMERCE' },
    { code: 'DOCUMENTS_READ', description: 'Consulter et télécharger les PDF', category: 'COMMERCE' },
    { code: 'SUBSCRIPTIONS_READ', description: 'Consulter les abonnements numériques', category: 'COMMERCE' },
    { code: 'SUBSCRIPTIONS_MANAGE', description: 'Gérer et affecter les licences', category: 'COMMERCE' },
    { code: 'SUBSCRIPTION_SECRETS_READ', description: 'Déchiffrer les accès et mots de passe', category: 'ADMINISTRATION' },
    { code: 'MONTHLY_CLOSING_MANAGE', description: 'Effectuer les clôtures mensuelles', category: 'FINANCE' },
    { code: 'REPORTS_READ', description: 'Consulter les rapports financiers', category: 'FINANCE' },
    { code: 'SETTINGS_MANAGE', description: 'Modifier les paramètres généraux', category: 'ADMINISTRATION' },
    { code: 'USERS_MANAGE', description: 'Gérer les utilisateurs et rôles', category: 'ADMINISTRATION' },
    { code: 'AUDIT_READ', description: 'Consulter les journaux d’audit', category: 'ADMINISTRATION' },
  ];

  for (const perm of permissionsList) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }
  console.log(`✅ [SEED] ${permissionsList.length} permissions granulaires créées.`);

  // 3. Création du Premier Administrateur (Argon2id)
  const adminPasswordHash = await hashPassword('AdminPassword123!');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nexora.com' },
    update: {},
    create: {
      name: 'Aminata Diallo',
      email: 'admin@nexora.com',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      active: true,
    },
  });

  // Attribution de toutes les permissions à l'Admin
  const allPermissions = await prisma.permission.findMany();
  for (const p of allPermissions) {
    await prisma.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId: adminUser.id,
          permissionId: p.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        permissionId: p.id,
      },
    });
  }
  console.log(`✅ [SEED] Administrateur créé : ${adminUser.name} (${adminUser.email})`);

  // 4. Clients
  const clientsData = [
    { name: 'Groupe Saphir', email: 'contact@saphir-group.sn', phone: '+221 77 123 45 67', address: 'Dakar Plateau' },
    { name: 'Studio Baobab', email: 'hello@baobab-studio.com', phone: '+225 07 89 01 23', address: 'Abidjan Cocody' },
    { name: 'Horizon Distribution', email: 'direction@horizon-distrib.ci', phone: '+225 05 44 33 22', address: 'Abidjan Treichville' },
    { name: 'Maison Naya', email: 'naya@boutique-naya.com', phone: '+221 78 987 65 43', address: 'Dakar Almadies' },
    { name: 'Atlas Services', email: 'info@atlas-services.net', phone: '+237 699 00 11 22', address: 'Douala Bonanjo' },
    { name: 'Kora & Co', email: 'sales@kora-and-co.com', phone: '+221 76 555 44 33', address: 'Dakar Point E' },
  ];

  const createdClients = [];
  for (const c of clientsData) {
    const client = await prisma.customer.upsert({
      where: { id: `client-${c.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}` },
      update: {},
      create: {
        id: `client-${c.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
      },
    });
    createdClients.push(client);
  }
  console.log(`✅ [SEED] ${createdClients.length} clients créés.`);

  // 5. Catalogue Produits & Services
  const productsData = [
    { sku: 'NX-EL-042', name: 'Terminal de paiement T4', category: 'Équipement', type: ItemType.PHYSICAL_PRODUCT, purchase: 140000, selling: 185000, stock: 4, threshold: 10 },
    { sku: 'NX-AC-017', name: 'Pack accessoires bureau', category: 'Accessoires', type: ItemType.PHYSICAL_PRODUCT, purchase: 30000, selling: 45000, stock: 38, threshold: 15 },
    { sku: 'NX-EL-031', name: 'Lecteur code-barres sans fil', category: 'Équipement', type: ItemType.PHYSICAL_PRODUCT, purchase: 65000, selling: 92000, stock: 7, threshold: 12 },
    { sku: 'NX-SE-009', name: 'Abonnement support annuel', category: 'Services', type: ItemType.CONSULTING_SERVICE, purchase: 0, selling: 240000, stock: 99, threshold: 0 },
    { sku: 'NX-AC-023', name: 'Station d’accueil USB-C', category: 'Accessoires', type: ItemType.PHYSICAL_PRODUCT, purchase: 55000, selling: 78000, stock: 26, threshold: 10 },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        name: p.name,
        category: p.category,
        type: p.type,
        purchasePrice: p.purchase,
        sellingPrice: p.selling,
        stockQuantity: p.stock,
        alertThreshold: p.threshold,
      },
    });
  }
  console.log(`✅ [SEED] ${productsData.length} produits et services créés.`);

  // 6. Services et Abonnements Numériques (Chiffrement AES-256-GCM)
  const canvaService = await prisma.digitalService.upsert({
    where: { id: 'service-canva-pro' },
    update: {},
    create: {
      id: 'service-canva-pro',
      name: 'Canva Pro Équipe',
      category: 'Design & Créatif',
    },
  });

  const encryptedSecret = encryptSecret(JSON.stringify({
    password: 'SecretPass_2026!#Canva',
    backupCodes: ['123456', '789012'],
    profilePin: '4490',
  }));

  const canvaAccount = await prisma.digitalAccount.upsert({
    where: { id: 'account-canva-01' },
    update: {},
    create: {
      id: 'account-canva-01',
      serviceId: canvaService.id,
      accountIdentifier: 'design@creative-hub.com',
      profileName: 'Compte Principal Studio',
      encryptedCredentials: encryptedSecret,
      encryptionVersion: 'AES-256-GCM-v1',
      isAssigned: true,
    },
  });

  await prisma.subscriptionAssignment.upsert({
    where: { id: 'sub-assignment-01' },
    update: {},
    create: {
      id: 'sub-assignment-01',
      customerId: createdClients[1].id, // Studio Baobab
      accountId: canvaAccount.id,
      startDate: new Date('2025-07-15'),
      endDate: new Date('2026-07-15'),
      durationMonths: 12,
      sellingPrice: 45000,
    },
  });
  console.log(`✅ [SEED] Abonnements numériques créés avec secrets chiffrés en AES-256-GCM.`);

  // 7. Ventes & Factures Réelles
  const salesData = [
    { ref: 'VTE-2025-0482', inv: 'FAC-2025-0382', client: createdClients[0], total: 2450000, paid: 2450000, status: SaleStatus.PAYEE },
    { ref: 'VTE-2025-0481', inv: 'FAC-2025-0381', client: createdClients[1], total: 875000, paid: 300000, status: SaleStatus.PARTIELLEMENT_PAYEE },
    { ref: 'VTE-2025-0480', inv: 'FAC-2025-0380', client: createdClients[2], total: 4125000, paid: 4125000, status: SaleStatus.PAYEE },
    { ref: 'VTE-2025-0478', inv: 'FAC-2025-0378', client: createdClients[4], total: 1380000, paid: 0, status: SaleStatus.CONFIRMEE },
  ];

  for (const s of salesData) {
    const sale = await prisma.sale.upsert({
      where: { reference: s.ref },
      update: {},
      create: {
        reference: s.ref,
        invoiceNumber: s.inv,
        customerId: s.client.id,
        userId: adminUser.id,
        totalTTC: s.total,
        subtotalHT: s.total * 0.82,
        taxAmount: s.total * 0.18,
        paidAmount: s.paid,
        remainingBalance: s.total - s.paid,
        status: s.status,
      },
    });

    // Enregistrement du paiement correspondant si payé
    if (s.paid > 0) {
      await prisma.payment.upsert({
        where: { reference: `PAY-${s.ref}` },
        update: {},
        create: {
          reference: `PAY-${s.ref}`,
          saleId: sale.id,
          amount: s.paid,
          userId: adminUser.id,
          notes: `Règlement facture ${s.inv}`,
        },
      });
    }
  }
  console.log(`✅ [SEED] Ventes, factures et encaissements créés avec succès.`);

  // 8. Fournisseurs & Achats
  const sup1 = await prisma.supplier.upsert({
    where: { id: 'sup-dakar-tech' },
    update: {},
    create: {
      id: 'sup-dakar-tech',
      name: 'Dakar Tech Logistique',
      contactName: 'Mamadou Ndiaye',
      phone: '+221 33 800 12 34',
      email: 'contact@dakar-tech.sn',
      address: 'Zone Industrielle Dakar',
    },
  });

  const sup2 = await prisma.supplier.upsert({
    where: { id: 'sup-abidjan-hardware' },
    update: {},
    create: {
      id: 'sup-abidjan-hardware',
      name: 'Abidjan Hardware Supplies',
      contactName: 'Ange Kouassi',
      phone: '+225 27 21 00 11',
      email: 'commercial@abidjan-hardware.ci',
      address: 'Zone 4 Marcory Abidjan',
    },
  });

  await prisma.purchaseOrder.upsert({
    where: { reference: 'ACH-2025-0128' },
    update: {},
    create: {
      reference: 'ACH-2025-0128',
      supplierId: sup1.id,
      totalAmount: 1850000,
      status: 'COMMANDE',
    },
  });

  await prisma.purchaseOrder.upsert({
    where: { reference: 'ACH-2025-0129' },
    update: {},
    create: {
      reference: 'ACH-2025-0129',
      supplierId: sup2.id,
      totalAmount: 620000,
      status: 'RECEPTIONNE',
    },
  });
  console.log(`✅ [SEED] Fournisseurs et commandes d'achat enregistrés.`);

  // 9. Dépenses d'exploitation
  const expensesData = [
    { ref: 'OP-0891', cat: 'Loyer bureaux', desc: 'Loyer bureau Dakar Plateau', amount: 450000, sup: sup1.id },
    { ref: 'OP-0892', cat: 'Télécoms & Internet', desc: 'Connexion Fibre Orange Pro', amount: 65000, sup: null },
    { ref: 'OP-0893', cat: 'Fournitures', desc: 'Fournitures et consommables', amount: 85000, sup: sup2.id },
  ];

  for (const exp of expensesData) {
    await prisma.expense.upsert({
      where: { reference: exp.ref },
      update: {},
      create: {
        reference: exp.ref,
        category: exp.cat,
        description: exp.desc,
        amount: exp.amount,
        supplierId: exp.sup,
        userId: adminUser.id,
      },
    });
  }
  console.log(`✅ [SEED] Dépenses d'exploitation enregistrées.`);

  // 10. Devis Commerciaux
  const devisDate = new Date();
  devisDate.setDate(devisDate.getDate() + 30);

  await prisma.quote.upsert({
    where: { reference: 'DEV-2025-0154' },
    update: {},
    create: {
      reference: 'DEV-2025-0154',
      customerId: createdClients[1].id,
      totalTTC: 1250000,
      status: 'ENVOYE',
      validUntil: devisDate,
      notes: 'Proposition refonte infrastructure',
    },
  });

  await prisma.quote.upsert({
    where: { reference: 'DEV-2025-0155' },
    update: {},
    create: {
      reference: 'DEV-2025-0155',
      customerId: createdClients[0].id,
      totalTTC: 3800000,
      status: 'BROUILLON',
      validUntil: devisDate,
      notes: 'Équipement terminaux biométriques',
    },
  });
  console.log(`✅ [SEED] Devis commerciaux enregistrés.`);

  // 11. Collaborateurs additionnels (Manager et Employé)
  const defaultPw = await hashPassword('Nexora2026!');
  await prisma.user.upsert({
    where: { email: 'koffi.mensah@nexora.com' },
    update: {},
    create: {
      name: 'Koffi Mensah',
      email: 'koffi.mensah@nexora.com',
      passwordHash: defaultPw,
      role: UserRole.MANAGER,
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'fatou.sow@nexora.com' },
    update: {},
    create: {
      name: 'Fatou Sow',
      email: 'fatou.sow@nexora.com',
      passwordHash: defaultPw,
      role: UserRole.EMPLOYEE,
      active: true,
    },
  });
  console.log(`✅ [SEED] Équipe et collaborateurs enregistrés.`);

  console.log('🎉 [SEED] Base de données PostgreSQL nexora initialisée avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ [SEED ERROR] :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
