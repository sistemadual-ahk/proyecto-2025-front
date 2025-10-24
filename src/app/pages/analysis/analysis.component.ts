import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { PageTitleComponent } from '../../components/page-title/page-title.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ChartService } from '../../services/chart.service';

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

  constructor(
    private router: Router,
    private chartService: ChartService
  ) {}

  ngOnInit() {
    this.initializeCharts();
  }

  private initializeCharts() {
    // Datos de ejemplo
    const monthlyData = [30, 40, 35, 50, 49, 60, 70, 91, 125, 110, 95, 80];
    const monthlyCategories = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const categoryData = [1200, 800, 600, 400, 300];
    const categoryLabels = ['Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Otros'];
    
    const donutData = [35, 25, 20, 15, 5];
    const donutLabels = ['Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Otros'];
    
    const incomeData = [2500, 2500, 2500, 2500, 2500, 2500];
    const expensesData = [2000, 2200, 1800, 2400, 2100, 2300];
    const periodCategories = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];

    // Inicializar gráficos
    this.monthlyChartOptions = this.chartService.getMonthlyExpensesChart(monthlyData, monthlyCategories);
    this.categoryChartOptions = this.chartService.getCategoryChart(categoryData, categoryLabels);
    this.donutChartOptions = this.chartService.getDonutChart(donutData, donutLabels);
    this.incomeVsExpensesOptions = this.chartService.getIncomeVsExpensesChart(incomeData, expensesData, periodCategories);
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
