import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SilentNotification {
  id: string;
  message: string;
  timestamp: Date;
  count: number;
  type: 'warning' | 'info' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class SilentNotificationService {
  private notifications = new BehaviorSubject<SilentNotification[]>([]);
  public notifications$ = this.notifications.asObservable();
  private maxNotifications = 10;

  constructor() {
    this.loadFromStorage();
  }

  addSilentNotification(message: string, type: 'warning' | 'info' | 'error' = 'warning'): void {
    const current = this.notifications.value;
    const existing = current.find(n => n.message === message);
    
    if (existing) {
      existing.count++;
      existing.timestamp = new Date();
    } else {
      const notification: SilentNotification = {
        id: Date.now().toString(),
        message,
        timestamp: new Date(),
        count: 1,
        type
      };
      current.unshift(notification);
    }
    
    // Limiter le nombre de notifications
    if (current.length > this.maxNotifications) {
      current.splice(this.maxNotifications);
    }
    
    this.notifications.next([...current]);
    this.saveToStorage();
  }

  removeNotification(id: string): void {
    const current = this.notifications.value;
    const filtered = current.filter(n => n.id !== id);
    this.notifications.next(filtered);
    this.saveToStorage();
  }

  clearAll(): void {
    this.notifications.next([]);
    this.saveToStorage();
  }

  getCount(): number {
    return this.notifications.value.reduce((sum, n) => sum + n.count, 0);
  }

  private saveToStorage(): void {
    localStorage.setItem('silentNotifications', JSON.stringify(this.notifications.value));
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('silentNotifications');
    if (stored) {
      try {
        const notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        this.notifications.next(notifications);
      } catch (e) {
        console.error('Erreur chargement notifications silencieuses:', e);
      }
    }
  }
}