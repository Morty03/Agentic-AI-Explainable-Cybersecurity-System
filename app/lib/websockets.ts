export class LiveWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  connect() {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    
    try {
      this.ws = new WebSocket(`${wsUrl}/ws/live`);
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
      };
      
      this.ws.onerror = (error) => {
        // Don't show errors for now - just log silently
        console.log('WebSocket connecting...');
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket closed');
        this.attemptReconnect();
      };
    } catch (error) {
      console.log('WebSocket not available');
    }
  }
  
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 3000);
    }
  }
  
  send(message: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    }
  }
  
  sendChat(question: string) {
    this.send(`chat:${question}`);
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const liveWebSocket = new LiveWebSocket();