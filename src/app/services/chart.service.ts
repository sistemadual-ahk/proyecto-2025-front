import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor() { }

  // Configuración base para gráficos con tema oscuro
  getBaseChartOptions() {
    return {
      chart: {
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
      colors: ['#10b981', '#6b46c1', '#f59e0b', '#ef4444'],
      xaxis: {
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
      grid: {
        borderColor: 'rgba(255, 255, 255, 0.1)'
      },
      legend: {
        labels: {
          colors: '#ffffff'
        }
      }
    };
  }

  // Gráfico de líneas para gastos mensuales
  getMonthlyExpensesChart(data: number[], categories: string[]) {
    return {
      ...this.getBaseChartOptions(),
      series: [{
        name: 'Gastos',
        data: data
      }],
      chart: {
        ...this.getBaseChartOptions().chart,
        type: 'line',
        height: 350
      },
      xaxis: {
        ...this.getBaseChartOptions().xaxis,
        categories: categories
      },
      title: {
        text: 'Gastos Mensuales',
        align: 'center',
        style: {
          color: '#ffffff',
          fontSize: '16px'
        }
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

  // Gráfico de barras para categorías
  getCategoryChart(data: number[], categories: string[]) {
    return {
      ...this.getBaseChartOptions(),
      series: [{
        name: 'Gastos por Categoría',
        data: data
      }],
      chart: {
        ...this.getBaseChartOptions().chart,
        type: 'bar',
        height: 350
      },
      xaxis: {
        ...this.getBaseChartOptions().xaxis,
        categories: categories
      },
      title: {
        text: 'Gastos por Categoría',
        align: 'center',
        style: {
          color: '#ffffff',
          fontSize: '16px'
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false
        }
      }
    };
  }

  // Gráfico de dona para distribución de gastos
  getDonutChart(data: number[], labels: string[]) {
    return {
      ...this.getBaseChartOptions(),
      series: data,
      chart: {
        ...this.getBaseChartOptions().chart,
        type: 'donut',
        height: 350
      },
      labels: labels,
      title: {
        text: 'Distribución de Gastos',
        align: 'center',
        style: {
          color: '#ffffff',
          fontSize: '16px'
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%'
          }
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#ffffff']
        }
      }
    };
  }

  // Gráfico de área para ingresos vs gastos
  getIncomeVsExpensesChart(incomeData: number[], expensesData: number[], categories: string[]) {
    return {
      ...this.getBaseChartOptions(),
      series: [
        {
          name: 'Ingresos',
          data: incomeData
        },
        {
          name: 'Gastos',
          data: expensesData
        }
      ],
      chart: {
        ...this.getBaseChartOptions().chart,
        type: 'area',
        height: 350
      },
      xaxis: {
        ...this.getBaseChartOptions().xaxis,
        categories: categories
      },
      title: {
        text: 'Ingresos vs Gastos',
        align: 'center',
        style: {
          color: '#ffffff',
          fontSize: '16px'
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100]
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      }
    };
  }
}
