import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logout-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="popup-overlay" *ngIf="isVisible">
      <div class="popup-content">
        <div class="popup-icon">👋</div>
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .popup-content {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease;
      min-width: 300px;
    }

    @keyframes slideIn {
      from { transform: translateY(-50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .popup-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    h3 {
      margin: 0 0 1rem 0;
      color: #28a745;
      font-size: 1.5rem;
    }

    p {
      margin: 0;
      color: #666;
      font-size: 1rem;
    }
  `]
})
export class LogoutPopupComponent {
  @Input() isVisible = false;
  @Input() title = '';
  @Input() message = '';
  @Output() closed = new EventEmitter<void>();

  ngOnInit(): void {
    if (this.isVisible) {
      setTimeout(() => {
        this.isVisible = false;
        this.closed.emit();
      }, 2000);
    }
  }
}