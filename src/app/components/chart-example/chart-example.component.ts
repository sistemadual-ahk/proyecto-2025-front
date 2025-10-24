import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-chart-example',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="chart-container">
      <h3>Ejemplo de Gráfico ApexCharts</h3>
      <apx-chart
        [series]="chartOptions.series"
        [chart]="chartOptions.chart"
        [xaxis]="chartOptions.xaxis"
        [title]="chartOptions.title"
        [colors]="chartOptions.colors"
      ></apx-chart>
    </div>
  `,
  styles: [`
    .chart-container {
      padding: 20px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      margin: 20px;
    }
    
    h3 {
      color: white;
      margin-bottom: 20px;
      text-align: center;
    }
  `]
})
export class ChartExampleComponent implements OnInit {
  chartOptions: any = {};

  ngOnInit() {
    this.chartOptions = {
      series: [{
        name: 'Gastos',
        data: [30, 40, 35, 50, 49, 60, 70, 91, 125]
      }],
      chart: {
        height: 350,
        type: 'line',
        background: 'transparent',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        }
      },
      colors: ['#10b981'],
      xaxis: {
        categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'],
        labels: {
          style: {
            colors: '#ffffff'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#ffffff'
          }
        }
      },
      title: {
        text: 'Gastos Mensuales',
        align: 'center',
        style: {
          color: '#ffffff',
          fontSize: '16px'
        }
      },
      grid: {
        borderColor: 'rgba(255, 255, 255, 0.1)'
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      markers: {
        size: 5,
        colors: ['#10b981'],
        strokeColors: '#ffffff',
        strokeWidth: 2
      }
    };
  }
}
