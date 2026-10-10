// tslint:disable
/* eslint-disable */

export class FakePlaygroundSDK {
  private isInitialized = false;
  private onGameEvent: ((event: any) => void) | null = null;
  private onPlayerPresence: ((presence: any) => void) | null = null;
  private onLobbyStatus: ((status: any) => void) | null = null;
  private onError: ((error: any) => void) | null = null;

  private lobbyId = 'fake-lobby-123';
  private gameId = 'fake-game-456';
  private myPlayerId = 'player-1';
  private isHost = true;
  private players: any[] = [];
  private playersCount = 1;

  async init(
    onGameEvent: (event: any) => void,
    onPlayerPresence: (presence: any) => void,
    onLobbyStatus?: (status: any) => void,
    onError?: (error: any) => void,
  ): Promise<void> {
    if (this.isInitialized) return;
    this.onGameEvent = onGameEvent;
    this.onPlayerPresence = onPlayerPresence;
    if (onLobbyStatus) this.onLobbyStatus = onLobbyStatus;
    if (onError) this.onError = onError;
    this.isInitialized = true;
    this.players = [
      {
        playerId: 'player-1',
        displayName: 'Player 1',
        isCurrentPlayer: true,
        isHost: true,
        score: 0,
      },
    ];
  }

  startGame(lobbyId?: string): void {
    if (this.onLobbyStatus) {
      this.onLobbyStatus({status: 'GAME_IN_PROGRESS', lobbyId: this.lobbyId});
    }
  }

  scoreUpdated(scoreData: any): void {
    if (this.players[0]) {
      this.players[0].score = scoreData.value || 0;
    }
  }

  levelComplete(level: number | string): void {}

  gameOver(lobbyId?: string): void {
    if (this.onLobbyStatus) {
      this.onLobbyStatus({status: 'GAME_ENDED', lobbyId: this.lobbyId});
    }
  }

  pauseStateChanged(isPaused: boolean): void {}
}
