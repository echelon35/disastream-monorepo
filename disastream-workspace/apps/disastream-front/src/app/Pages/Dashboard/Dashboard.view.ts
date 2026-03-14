import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { AlertApiService } from 'src/app/Services/AlertApiService';
import { SharedModule } from 'src/app/Shared/Shared.module';

@Component({
    templateUrl: './Dashboard.view.html',
    imports: [BaseChartDirective, CommonModule, SharedModule],
    standalone: true
})
export class DashboardView implements OnInit {
  title = 'Connectez-vous aux forces de la nature avec Disastream';
  loading = true;

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(148,159,177,0.2)',
        borderColor: 'rgba(148,159,177,1)',
        pointBackgroundColor: 'rgba(148,159,177,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)',
        fill: 'origin',
        offset: 1
      },
    ],
    labels: ['', '', '', '', '', '', ''],
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0,
      },
    },
    scales: {
      x: {
        min: 0,
        grid: {
          z: 1,
        },
        ticks: {
          color: 'rgba(255,255,255,0.5)',
          z: 2,
        },
      },
      // We use this empty structure as a placeholder for dynamic theming.
      y: {
        beginAtZero: true,
        min: 0,
        position: 'left',
        grid: {
          color: 'rgba(255,255,255,0.1)',
          z: 1,
        },
        ticks: {
          color: 'rgba(255,255,255,0.5)',
          z: 2,
          stepSize: 1,
        },
      },
    },
    plugins: {
      legend: { display: true },
      colors: { },
      title: {
        text: 'Vos alertes de la semaine',
      }
    }
  };

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  datas: number[] = [];
  legends: string[] = [];

  constructor(private readonly alertApiService: AlertApiService){
    const el = document.getElementById('myGraph') as HTMLCanvasElement;
    if(el != null){
      const canvas = el!.getContext('2d');
      const purple_orange_gradient = canvas!.createLinearGradient(0, 0, 0, 250);
      purple_orange_gradient!.addColorStop(1, 'rgba(80,47,68,0.5)');
      purple_orange_gradient!.addColorStop(0, 'rgba(246,211,1235,0.5)');
      this.lineChartData.datasets[0].backgroundColor = purple_orange_gradient;
    }
  }

  ngOnInit(): void {
    this.lastWeek();
  }

  public lastWeek(): void{
    this.alertApiService.getLastWeekStatistics().subscribe(periods => {
      this.lineChartData.datasets[0].data = [];
      this.lineChartData.labels = [];

      this.lineChartData.labels.length = 0;
      for (let i = periods.length - 1; i >= 0; i--) {
        const currentDate = new Date(periods[i].perioditem);
        this.lineChartData.labels.push(currentDate.toLocaleDateString('fr'));
        // this.lineChartData.datasets[0].data.push(periods[i].count)
        this.lineChartData.datasets[0].data.push(periods[i].count)
      }
      this.chart?.update();
      this.loading = false;
    })
  }
}