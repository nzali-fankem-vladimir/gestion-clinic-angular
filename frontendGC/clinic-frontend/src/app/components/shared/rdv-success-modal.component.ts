import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rdv-success-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="success-icon">✅</div>
          <h3>Rendez-vous créé !</h3>
        </div>
        <div class="modal-body">
          <p>Le rendez-vous a été créé avec succès.</p>
          <div class="rdv-details" *ngIf="rdvDetails">
            <div class="detail-item">
              <strong>Patient:</strong> {{ rdvDetails.patientNom }}
            </div>
            <div class="detail-item">
              <strong>Médecin:</strong> {{ rdvDetails.medecinNom }}
            </div>
            <div class="detail-item">
              <strong>Date:</strong> {{ rdvDetails.date }}
            </div>
            <div class="detail-item">
              <strong>Heure:</strong> {{ rdvDetails.heure }}
            </div>
            <div class="detail-item" *ngIf="rdvDetails.motif">
              <strong>Motif:</strong> {{ rdvDetails.motif }}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button (click)="close()" class="btn-primary">OK</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from { transform: translateY(-50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .modal-header {
      text-align: center;
      padding: 2rem 2rem 1rem;
      border-bottom: 1px solid #eee;
    }

    .success-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .modal-header h3 {
      margin: 0;
      color: #28a745;
      font-size: 1.5rem;
    }

    .modal-body {
      padding: 1.5rem 2rem;
    }

    .modal-body p {
      text-align: center;
      color: #666;
      margin-bottom: 1.5rem;
    }

    .rdv-details {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #dee2e6;
    }

    .detail-item:last-child {
      border-bottom: none;
    }

    .detail-item strong {
      color: #333;
    }

    .modal-footer {
      padding: 1rem 2rem 2rem;
      text-align: center;
    }

    .btn-primary {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      background: #218838;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    }
  `]
})
export class RdvSuccessModalComponent {
  @Input() isVisible = false;
  @Input() rdvDetails: any = null;
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.isVisible = false;
    this.closed.emit();
  }
}