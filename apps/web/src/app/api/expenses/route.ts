import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      include: { supplier: true, user: true },
      orderBy: { expenseDate: 'desc' },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { category, supplierId, description, amount, method, receiptReference } = await req.json();
    if (!category || !description || !amount) {
      return NextResponse.json({ error: 'Catégorie, description et montant requis' }, { status: 400 });
    }

    // Vérification du verrouillage comptable (MonthlyClosing)
    const now = new Date();
    const isClosed = await prisma.monthlyClosing.findFirst({
      where: {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        isLocked: true,
      },
    });
    if (isClosed) {
      return NextResponse.json(
        { error: `Période comptable ${now.getMonth() + 1}/${now.getFullYear()} clôturée et verrouillée. Aucune dépense ne peut être enregistrée.` },
        { status: 403 }
      );
    }

    const adminUser = await prisma.user.findFirst();
    const count = await prisma.expense.count();
    const reference = `DEP-${String(count + 1).padStart(4, '0')}`;

    const expense = await prisma.expense.create({
      data: {
        reference,
        category,
        supplierId: supplierId || null,
        description,
        amount,
        method: method || 'CASH',
        receiptReference,
        userId: adminUser?.id || '',
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
