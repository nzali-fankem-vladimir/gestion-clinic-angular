import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WebSocketService, Notification as WSNotification } from './websocket.service';
import { SilentNotificationService } from './silent-notification.service';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  rdvId?: number;
  objMessage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notifications.asObservable();
  private maxNotifications = 5; // Limite le nombre de notifications affichées
  private errorThrottle = new Map<string, number>(); // Throttle pour les erreurs répétitives

  constructor(
    private webSocketService: WebSocketService,
    private silentNotificationService: SilentNotificationService
  ) {
    this.loadNotificationsFromStorage();
    this.webSocketService.getNotifications().subscribe(wsNotifications => {
      wsNotifications.forEach(wsNotif => {
        this.showWebSocketNotification(wsNotif);
      });
    });
  }

  addNotification(type: Notification['type'], title: string, message: string, rdvId?: number, objMessage?: string): void {
    // Filtrer les erreurs répétitives
    if (type === 'error' && this.shouldThrottleError(message)) {
      return;
    }

    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      rdvId,
      objMessage
    };

    const current = this.notifications.value;
    // Limiter le nombre de notifications et éviter les doublons
    const filtered = current.filter(n => n.message !== message).slice(0, this.maxNotifications - 1);
    const updated = [notification, ...filtered];
    this.notifications.next(updated);
    this.saveNotificationsToStorage(updated);

    // Ne pas supprimer automatiquement les notifications pour qu'elles restent dans le panel
    // Les utilisateurs peuvent les supprimer manuellement
  }

  removeNotification(id: string): void {
    const current = this.notifications.value;
    this.notifications.next(current.filter(n => n.id !== id));
  }

  markAsRead(id: string): void {
    const current = this.notifications.value;
    const updated = current.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.notifications.next(updated);
    this.saveNotificationsToStorage(updated);
  }

  clearAll(): void {
    this.notifications.next([]);
  }

  success(title: string, message: string): void {
    this.addNotification('success', title, message);
  }

  error(title: string, message: string): void {
    // Filtrer les erreurs non critiques pour éviter l'encombrement
    if (this.isNonCriticalError(message)) {
      console.warn(`[${title}] ${message}`);
      return;
    }
    this.addNotification('error', title, message);
  }

  warning(title: string, message: string): void {
    this.addNotification('warning', title, message);
  }

  info(title: string, message: string): void {
    this.addNotification('info', title, message);
  }

  private showWebSocketNotification(wsNotif: WSNotification): void {
    let type: Notification['type'] = 'info';
    let title = 'Notification';
    
    switch (wsNotif.objMessage) {
      case 'NEW_RDV':
        type = 'success';
        title = 'Nouveau RDV';
        break;
      case 'RDV_CANCELLED':
        type = 'warning';
        title = 'RDV Annulé';
        break;
      case 'RDV_REMINDER':
        type = 'info';
        title = 'Rappel RDV';
        break;
      case 'RDV_CONFIRMED':
        type = 'success';
        title = 'RDV Confirmé';
        break;
      case 'RDV_COMPLETED':
        type = 'info';
        title = 'RDV Terminé';
        break;
    }
    
    this.addNotification(type, title, wsNotif.message, wsNotif.rdvId, wsNotif.objMessage);
  }

  private saveNotificationsToStorage(notifications: Notification[]): void {
    localStorage.setItem('notifications', JSON.stringify(notifications.slice(0, 20)));
  }

  private loadNotificationsFromStorage(): void {
    // Vider les anciennes notifications au démarrage
    localStorage.removeItem('notifications');
    this.notifications.next([]);
  }

  filterByType(type?: string): Notification[] {
    const all = this.notifications.value;
    return type ? all.filter(n => n.objMessage === type) : all;
  }

  getUnreadCount(): number {
    return this.notifications.value.filter(n => !n.read).length;
  }

  connectWebSocket(): void {
    this.webSocketService.connect();
  }

  disconnectWebSocket(): void {
    this.webSocketService.disconnect();
  }

  private shouldThrottleError(message: string): boolean {
    const now = Date.now();
    const lastShown = this.errorThrottle.get(message) || 0;
    const throttleTime = 30000; // 30 secondes
    
    if (now - lastShown < throttleTime) {
      return true;
    }
    
    this.errorThrottle.set(message, now);
    return false;
  }

  private getAutoRemoveDelay(type: Notification['type']): number {
    // Retourner 0 pour désactiver l'auto-suppression
    return 0;
  }

  private isNonCriticalError(message: string): boolean {
    const nonCriticalPatterns = [
      'Impossible de charger les statistiques',
      'Aucun rendez-vous récent trouvé',
      'Erreur chargement revenus',
      'Données non disponibles',
      'Connexion temporairement indisponible',
      'Erreur chargement stats',
      'Erreur chargement RDV récents',
      'Erreur chargement factures'
    ];
    
    const isNonCritical = nonCriticalPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (isNonCritical) {
      // Envoyer vers les notifications silencieuses
      this.silentNotificationService.addSilentNotification(message, 'warning');
    }
    
    return isNonCritical;
  }

  // Méthode pour les erreurs critiques uniquement
  criticalError(title: string, message: string): void {
    this.addNotification('error', title, message);
  }

  // Méthode pour les popups temporaires (déconnexion, etc.)
  showPopup(title: string, message: string): void {
    // Cette méthode sera utilisée pour déclencher des popups sans les ajouter aux notifications
    // Les composants peuvent s'abonner à un observable spécifique pour les popups
  }
}