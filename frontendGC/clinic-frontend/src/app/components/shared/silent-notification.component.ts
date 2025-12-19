import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SilentNotificationService, SilentNotification } from '../../services/silent-notification.service';

@Component({
  selector: 'app-silent-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="silent-indicator" *ngIf="hasNotifications" (click)="togglePanel()">
      <span class="indicator-icon">⚠️</span>
      <span class="indicator-count">{{ totalCount }}</span>
    </div>
    
    <div class="silent-panel" *ngIf="showPanel" (click)="$event.stopPropagation()">
      <div class="panel-header">
        <h5>Notifications système ({{ notifications.length }})</h5>
        <button (click)="clearAll()" class="btn-clear">Effacer</button>
      </div>
      <div class="panel-content">
        <div *ngFor="let notif of notifications" class="silent-item">
          <div class="item-header">
            <span class="item-icon">{{ getTypeIcon(notif.type) }}</span>
            <div class="item-message">{{ notif.message }}</div>
          </div>
          <div class="item-meta">
            <span class="item-time">{{ notif.timestamp | date:'HH:mm' }}</span>
            <span class="item-count" *ngIf="notif.count > 1">({{ notif.count }}x)</span>
          </div>
        </div>
        <div *ngIf="notifications.length === 0" class="no-notifications">
          Aucune notification système
        </div>
      </div>
    </div>
    
    <div class="overlay" *ngIf="showPanel" (click)="closePanel()"></div>
  `,
  styles: [`
    .silent-indicator {
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: #ffc107;
      color: #000;
      padding: 8px 12px;
      border-radius: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      font-weight: bold;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 1000;
      transition: all 0.3s ease;
    }
    
    .silent-indicator:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    
    .indicator-icon {
      font-size: 14px;
    }
    
    .indicator-count {
      background: #dc3545;
      color: white;
      border-radius: 10px;
      padding: 2px 6px;
      font-size: 10px;
      min-width: 16px;
      text-align: center;
    }
    
    .silent-panel {
      position: fixed;
      bottom: 70px;
      left: 20px;
      width: 300px;
      max-height: 400px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      z-index: 1001;
      overflow: hidden;
    }
    
    .panel-header {
      background: #f8f9fa;
      padding: 12px;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .panel-header h5 {
      margin: 0;
      font-size: 14px;
      color: #333;
    }
    
    .btn-clear {
      background: #dc3545;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
    }
    
    .panel-content {
      max-height: 300px;
      overflow-y: auto;
    }
    
    .silent-item {
      padding: 10px 12px;
      border-bottom: 1px solid #eee;
    }
    
    .item-header {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      margin-bottom: 4px;
    }
    
    .item-icon {
      font-size: 12px;
      margin-top: 1px;
    }
    
    .item-message {
      font-size: 12px;
      color: #666;
      flex: 1;
    }
    
    .item-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .item-time {
      font-size: 10px;
      color: #999;
    }
    
    .item-count {
      font-size: 10px;
      color: #dc3545;
      font-weight: bold;
    }
    
    .no-notifications {
      padding: 20px;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
    
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 999;
    }
  `]
})
export class SilentNotificationComponent implements OnInit {
  notifications: SilentNotification[] = [];
  showPanel = false;
  
  get hasNotifications(): boolean {
    return this.notifications.length > 0;
  }
  
  get totalCount(): number {
    return this.silentNotificationService.getCount();
  }

  constructor(private silentNotificationService: SilentNotificationService) {}

  ngOnInit(): void {
    this.silentNotificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
  }



  togglePanel(): void {
    this.showPanel = !this.showPanel;
  }

  closePanel(): void {
    this.showPanel = false;
  }

  clearAll(): void {
    this.silentNotificationService.clearAll();
    this.showPanel = false;
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  }
}