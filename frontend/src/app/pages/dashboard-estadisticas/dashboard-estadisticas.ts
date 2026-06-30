import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Navbar } from '../../shared/navbar/navbar';
import { EstadisticasService } from '../../services/estadisticas';
import { ModalService } from '../../services/modal';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-estadisticas',
  imports: [Navbar, ReactiveFormsModule, RouterLink],
  templateUrl: './dashboard-estadisticas.html',
  styleUrl: './dashboard-estadisticas.scss',
})
export class DashboardEstadisticas implements AfterViewInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly estadisticasService = inject(EstadisticasService);
  private readonly modal = inject(ModalService);

  private readonly chartPublicaciones = viewChild<ElementRef<HTMLCanvasElement>>('chartPublicaciones');
  private readonly chartComentarios = viewChild<ElementRef<HTMLCanvasElement>>('chartComentarios');
  private readonly chartComentariosPub = viewChild<ElementRef<HTMLCanvasElement>>('chartComentariosPub');

  private charts: Chart[] = [];

  readonly cargando = signal(false);

  readonly filtrosForm = this.fb.nonNullable.group({
    desde: [this.haceDiasIso(30)],
    hasta: [this.hoyIso()],
  });

  ngAfterViewInit(): void {
    this.cargarEstadisticas();
  }

  ngOnDestroy(): void {
    this.destruirCharts();
  }

  aplicarFiltros(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    const params = this.filtrosForm.getRawValue();
    this.cargando.set(true);
    this.destruirCharts();

    this.estadisticasService.publicacionesPorUsuario(params).subscribe({
      next: (respuesta) => {
        this.renderPublicacionesChart(respuesta.datos);
        this.cargarComentarios(params);
      },
      error: () => this.mostrarError(),
    });
  }

  private cargarComentarios(params: { desde: string; hasta: string }): void {
    this.estadisticasService.comentarios(params).subscribe({
      next: (respuesta) => {
        this.renderComentariosChart(respuesta.porDia, respuesta.total);
        this.cargarComentariosPorPublicacion(params);
      },
      error: () => this.mostrarError(),
    });
  }

  private cargarComentariosPorPublicacion(params: { desde: string; hasta: string }): void {
    this.estadisticasService.comentariosPorPublicacion(params).subscribe({
      next: (respuesta) => {
        this.renderComentariosPublicacionChart(respuesta.datos);
        this.cargando.set(false);
      },
      error: () => this.mostrarError(),
    });
  }

  private renderPublicacionesChart(
    datos: { nombreUsuario: string; cantidad: number }[],
  ): void {
    const canvas = this.chartPublicaciones()?.nativeElement;
    if (!canvas) {
      return;
    }

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: datos.map((d) => `@${d.nombreUsuario}`),
        datasets: [
          {
            label: 'Publicaciones',
            data: datos.map((d) => d.cantidad),
            backgroundColor: 'rgba(139, 92, 246, 0.75)',
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.06)' } },
          y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.06)' }, beginAtZero: true },
        },
      },
    };

    this.charts.push(new Chart(canvas, config));
  }

  private renderComentariosChart(
    porDia: { fecha: string; cantidad: number }[],
    total: number,
  ): void {
    const canvas = this.chartComentarios()?.nativeElement;
    if (!canvas) {
      return;
    }

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: porDia.map((d) => d.fecha),
        datasets: [
          {
            label: `Comentarios (total: ${total})`,
            data: porDia.map((d) => d.cantidad),
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.15)',
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#f3f4f6' } } },
        scales: {
          x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.06)' } },
          y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.06)' }, beginAtZero: true },
        },
      },
    };

    this.charts.push(new Chart(canvas, config));
  }

  private renderComentariosPublicacionChart(
    datos: { titulo: string; cantidad: number }[],
  ): void {
    const canvas = this.chartComentariosPub()?.nativeElement;
    if (!canvas) {
      return;
    }

    const labels = datos.map((d) =>
      d.titulo.length > 28 ? `${d.titulo.slice(0, 28)}…` : d.titulo,
    );

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Comentarios',
            data: datos.map((d) => d.cantidad),
            backgroundColor: 'rgba(244, 114, 182, 0.75)',
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.06)' }, beginAtZero: true },
          y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.06)' } },
        },
      },
    };

    this.charts.push(new Chart(canvas, config));
  }

  private destruirCharts(): void {
    this.charts.forEach((chart) => chart.destroy());
    this.charts = [];
  }

  private mostrarError(): void {
    this.cargando.set(false);
    this.modal.open({
      title: 'Error',
      message: 'No pudimos cargar las estadísticas.',
      type: 'error',
    });
  }

  private hoyIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private haceDiasIso(dias: number): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dias);
    return fecha.toISOString().slice(0, 10);
  }
}
