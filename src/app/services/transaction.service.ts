import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  subcategory: string;
  wallet: string;
  date: string;
  time: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  public transactions$ = this.transactionsSubject.asObservable();

  // Datos iniciales de ejemplo
  private initialTransactions: Transaction[] = [
    {
      id: 1,
      type: 'expense',
      amount: 4500,
      description: 'Supermercado',
      category: 'Alimentación',
      subcategory: 'Supermercado',
      wallet: 'Mercado Pago',
      date: '2024-01-15',
      time: '14:30'
    },
    {
      id: 2,
      type: 'income',
      amount: 45000,
      description: 'Salario',
      category: 'Ingresos',
      subcategory: 'Salario',
      wallet: 'Santander',
      date: '2024-01-15',
      time: '14:30'
    },
    {
      id: 3,
      type: 'expense',
      amount: 3200,
      description: 'Combustible',
      category: 'Transporte',
      subcategory: 'Combustible',
      wallet: 'Mercado Pago',
      date: '2024-01-15',
      time: '14:30'
    }
  ];

  constructor() {
    // Inicializar con datos de ejemplo
    this.transactionsSubject.next(this.initialTransactions);
  }

  // Obtener todas las transacciones
  getTransactions(): Transaction[] {
    return this.transactionsSubject.value;
  }

  // Agregar nueva transacción
  addTransaction(transaction: Omit<Transaction, 'id' | 'time'>): void {
    // Asegurar que siempre haya una descripción válida
    const description = transaction.description?.trim() || 
                       transaction.category || 
                       (transaction.type === 'income' ? 'Ingreso' : 'Gasto');

    const newTransaction: Transaction = {
      ...transaction,
      description: description,
      id: this.getNextId(),
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };

    const currentTransactions = this.transactionsSubject.value;
    this.transactionsSubject.next([newTransaction, ...currentTransactions]);
  }

  // Obtener transacciones agrupadas por fecha
  getGroupedTransactions(): { date: string; transactions: Transaction[] }[] {
    const transactions = this.transactionsSubject.value;
    const groups: { [key: string]: Transaction[] } = {};
    
    transactions.forEach(transaction => {
      const dateKey = this.formatDate(transaction.date);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });
    
    // Convertir a array y ordenar por fecha (más reciente primero)
    return Object.keys(groups)
      .map(date => ({
        date: date,
        transactions: groups[date]
      }))
      .sort((a, b) => {
        const dateA = new Date(transactions.find(t => this.formatDate(t.date) === a.date)?.date || '');
        const dateB = new Date(transactions.find(t => this.formatDate(t.date) === b.date)?.date || '');
        return dateB.getTime() - dateA.getTime();
      });
  }

  // Obtener movimientos recientes (últimos 3)
  getRecentMovements(): any[] {
    const transactions = this.transactionsSubject.value.slice(0, 3);
    return transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      category: transaction.category,
      description: transaction.description,
      subcategory: transaction.subcategory,
      icon: this.getIconForCategory(transaction.category),
      amount: transaction.type === 'income' ? transaction.amount : -transaction.amount,
      date: this.formatDateForHome(transaction.date),
      color: transaction.type === 'income' ? '#10b981' : this.getColorForCategory(transaction.category)
    }));
  }

  // Obtener estadísticas
  getStats(): { income: number; expenses: number; balance: number } {
    const transactions = this.transactionsSubject.value;
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses
    };
  }

  // Función para formatear la fecha
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  }

  // Función para formatear la fecha para home
  private formatDateForHome(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoy, ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer, ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + ', ' + 
             date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
  }

  // Función para obtener el ícono de la categoría
  private getIconForCategory(category: string): string {
    const iconMap: { [key: string]: string } = {
      'Alimentación': 'mdi-cart',
      'Transporte': 'mdi-car',
      'Entretenimiento': 'mdi-movie',
      'Salud': 'mdi-medical-bag',
      'Educación': 'mdi-school',
      'Vivienda': 'mdi-home',
      'Ingresos': 'mdi-cash-plus',
      'Otros': 'mdi-dots-horizontal'
    };
    return iconMap[category] || 'mdi-cash';
  }

  // Función para obtener el color de la categoría
  private getColorForCategory(category: string): string {
    const colorMap: { [key: string]: string } = {
      'Alimentación': '#f59e0b',
      'Transporte': '#3b82f6',
      'Entretenimiento': '#8b5cf6',
      'Salud': '#ef4444',
      'Educación': '#10b981',
      'Vivienda': '#6366f1',
      'Ingresos': '#3DCD99',
      'Otros': '#6b7280'
    };
    return colorMap[category] || '#6b7280';
  }

  // Obtener el siguiente ID
  private getNextId(): number {
    const transactions = this.transactionsSubject.value;
    if (transactions.length === 0) {
      return 1;
    }
    
    const maxId = Math.max(...transactions.map(t => t.id || 0));
    return maxId + 1;
  }
}
