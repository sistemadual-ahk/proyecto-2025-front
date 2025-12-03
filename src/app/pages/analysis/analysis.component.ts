import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { PageTitleComponent } from '../../components/page-title/page-title.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ChartService } from '../../services/chart.service';

export interface AnalysisData {
    monthlyData: number[]; 
    monthlyCategories: string[]; 
    categoryData: number[]; 
    categoryLabels: string[]; 
    donutData: number[]; 
    donutLabels: string[]; 
    incomeData: number[]; 
    expensesData: number[]; 
    periodCategories: string[]; 
}

export type AnalysisPeriod = 'weekly' | 'monthly' | 'annual';

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, PageTitleComponent, NgApexchartsModule],
  templateUrl: './analysis.component.html',
  styleUrl: './analysis.component.scss',
})
export class AnalysisComponent implements OnInit {
  monthlyChartOptions: any = {};
  categoryChartOptions: any = {};
  donutChartOptions: any = {};
  incomeVsExpensesOptions: any = {};
  selectedPeriod: 'weekly' | 'monthly' | 'annual' = 'monthly';
  selectedDate: Date = new Date(); // Fecha actual por defecto

  constructor(
    private router: Router,
    private chartService: ChartService
  ) {}

  ngOnInit() {
    this.initializeCharts();
  }

  private initializeCharts() {
    this.updateChartsData();
  }

  changePeriod(period: 'weekly' | 'monthly' | 'annual') {
    this.selectedPeriod = period;
    this.updateChartsData();
  }

  get formattedDate(): string {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[this.selectedDate.getMonth()]} ${this.selectedDate.getFullYear()}`;
  }

  get canGoNext(): boolean {
    const today = new Date();
    let nextDate: Date;

    switch (this.selectedPeriod) {
      case 'weekly':
        nextDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, 1);
        break;
      case 'annual':
        nextDate = new Date(this.selectedDate.getFullYear() + 1, this.selectedDate.getMonth(), 1);
        break;
      default:
        nextDate = today;
    }

    return nextDate <= today;
  }

  previousPeriod() {
    switch (this.selectedPeriod) {
      case 'weekly':
        this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate() - 7);
        break;
      case 'monthly':
        this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() - 1, 1);
        break;
      case 'annual':
        this.selectedDate = new Date(this.selectedDate.getFullYear() - 1, this.selectedDate.getMonth(), 1);
        break;
    }
    this.updateChartsData();
  }

  nextPeriod() {
    if (!this.canGoNext) {
      return; // No permitir avanzar a fechas futuras
    }

    switch (this.selectedPeriod) {
      case 'weekly':
        this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate() + 7);
        break;
      case 'monthly':
        this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, 1);
        break;
      case 'annual':
        this.selectedDate = new Date(this.selectedDate.getFullYear() + 1, this.selectedDate.getMonth(), 1);
        break;
    }
    this.updateChartsData();
  }

  private updateChartsData() {
    this.chartService.getAnalysisData(this.selectedPeriod, this.selectedDate)
      .subscribe({
        next: (data: AnalysisData) => {
          // 2. Asignar la data REAL del backend a las opciones de los gráficos
          
          // Gráfico 1: Mensual/Egresos a lo largo del tiempo
          this.monthlyChartOptions = this.chartService.getMonthlyExpensesChart(
            data.monthlyData, 
            data.monthlyCategories
          );
          
          // Gráfico 2 & 3: Egresos por Categoría (Barras y Dona)
          this.categoryChartOptions = this.chartService.getCategoryChart(
            data.categoryData, 
            data.categoryLabels
          );
          this.donutChartOptions = this.chartService.getDonutChart(
            data.donutData, 
            data.donutLabels
          );
          
          // Gráfico 4: Ingresos vs Egresos
          this.incomeVsExpensesOptions = this.chartService.getIncomeVsExpensesChart(
            data.incomeData, 
            data.expensesData, 
            data.periodCategories
          );
        },
        error: (error) => {
          // Manejo de errores (ej: mostrar notificación al usuario)
          console.error('Error al cargar datos del análisis:', error);
        }
      });
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}

  /* private getDataByPeriod(period: 'weekly' | 'monthly' | 'annual'): {
    monthlyData: number[];
    monthlyCategories: string[];
    categoryData: number[];
    categoryLabels: string[];
    donutData: number[];
    donutLabels: string[];
    incomeData: number[];
    expensesData: number[];
    periodCategories: string[];
  } {
    // TODO: En el futuro, estos datos vendrán de un servicio que consulta al backend
    // Factor para variar los datos según el mes/año seleccionado
    const monthFactor = (this.selectedDate.getMonth() + 1) / 12;
    const yearFactor = this.selectedDate.getFullYear() - 2024;
    const variationFactor = 1 + (monthFactor * 0.3) + (yearFactor * 0.1);
    
    switch (period) {
      case 'weekly':
        return {
          monthlyData: [10, 15, 12, 18, 14, 20, 16].map(v => Math.round(v * variationFactor)),
          monthlyCategories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
          categoryData: [300, 200, 150, 100, 80].map(v => Math.round(v * variationFactor)),
          categoryLabels: ['Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Otros'],
          donutData: [35, 25, 20, 15, 5],
          donutLabels: ['Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Otros'],
          incomeData: [600, 600, 600, 600, 600, 600, 600].map(v => Math.round(v * variationFactor)),
          expensesData: [450, 520, 480, 550, 490, 530, 510].map(v => Math.round(v * variationFactor)),
          periodCategories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
        };
      
      case 'monthly':
        return {
          monthlyData: [30, 40, 35, 50, 49, 60, 70, 91, 125, 110, 95, 80].map(v => Math.round(v * variationFactor)),
          monthlyCategories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
          categoryData: [1200, 800, 600, 400, 300].map(v => Math.round(v * variationFactor)),
          categoryLabels: ['Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Otros'],
          donutData: [35, 25, 20, 15, 5],
          donutLabels: ['Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Otros'],
          incomeData: [2500, 2500, 2500, 2500, 2500, 2500].map(v => Math.round(v * variationFactor)),
          expensesData: [2000, 2200, 1800, 2400, 2100, 2300].map(v => Math.round(v * variationFactor)),
          periodCategories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
        };
      
      case 'annual':
        const baseYear = this.selectedDate.getFullYear() - 5;
        return {
          monthlyData: [8000, 9000, 8500, 10000, 9500, 11000].map(v => Math.round(v * variationFactor)),
          monthlyCategories: Array.from({length: 6}, (_, i) => (baseYear + i).toString()),
          categoryData: [15000, 10000, 7500, 5000, 3500].map(v => Math.round(v * variationFactor)),
          categoryLabels: ['Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Otros'],
          donutData: [35, 25, 20, 15, 5],
          donutLabels: ['Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Otros'],
          incomeData: [30000, 32000, 34000, 36000, 38000, 40000].map(v => Math.round(v * variationFactor)),
          expensesData: [25000, 27000, 26000, 29000, 28000, 31000].map(v => Math.round(v * variationFactor)),
          periodCategories: Array.from({length: 6}, (_, i) => (baseYear + i).toString())
        };
      
      default:
        return this.getDataByPeriod('monthly');
    }
  }*/