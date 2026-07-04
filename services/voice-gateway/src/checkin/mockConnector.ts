// Deterministic mock CheckInConnector — lets the rules pack + orchestration be built,
// tested, and demoed with zero DaySmart API access. Fixtures are seeded at construction;
// swap this for a real `daysmart` connector later without touching the rules or callers
// (same seam as src/adapter/mock.ts for booking).

import type { CheckInConnector, CheckInResult, EligibilitySnapshot, Participant, Session } from "./types";

export interface MockFixture {
  participant: Participant;
  sessions: Session[];
  onRoster: Record<string, boolean>; // sessionId -> on roster
  waiverOnFile: boolean;
  waiverExpiresIso?: string;
  accountHold: boolean;
}

export class MockCheckInConnector implements CheckInConnector {
  readonly name = "mock";
  private checkedIn = new Map<string, CheckInResult>(); // idempotencyKey -> result

  constructor(private fixtures: MockFixture[]) {}

  async findParticipant({ name, phone, memberId }: { name?: string; phone?: string; memberId?: string }): Promise<Participant[]> {
    return this.fixtures
      .map((f) => f.participant)
      .filter((p) =>
        (memberId && p.participantId === memberId) ||
        (phone && p.phone === phone) ||
        (name && p.name.toLowerCase() === name.toLowerCase()),
      );
  }

  async getTodaysSessions({ participantId }: { participantId: string }): Promise<Session[]> {
    return this.fixtures.find((f) => f.participant.participantId === participantId)?.sessions ?? [];
  }

  async getEligibility({ participantId, sessionId }: { participantId: string; sessionId: string }): Promise<EligibilitySnapshot> {
    const matches = this.fixtures.filter((f) => f.participant.participantId === participantId);
    const fixture = matches[0];
    const session = fixture?.sessions.find((s) => s.sessionId === sessionId);
    if (!fixture || !session) throw new Error("unknown participant or session");
    return {
      participantId,
      sessionId,
      identityMatchCount: matches.length,
      onRoster: fixture.onRoster[sessionId] ?? false,
      session,
      waiverOnFile: fixture.waiverOnFile,
      waiverExpiresIso: fixture.waiverExpiresIso,
      accountHold: fixture.accountHold,
      isMinor: fixture.participant.isMinor,
      guardianOnFile: fixture.participant.guardianOnFile,
    };
  }

  async checkIn({ participantId, sessionId, idempotencyKey }: { participantId: string; sessionId: string; idempotencyKey: string }): Promise<CheckInResult> {
    const existing = this.checkedIn.get(idempotencyKey);
    if (existing) return { ...existing, alreadyCheckedIn: true };
    const result: CheckInResult = { checkInRef: `MOCK-CI-${idempotencyKey.slice(0, 8)}`, sessionId, participantId, alreadyCheckedIn: false };
    this.checkedIn.set(idempotencyKey, result);
    return result;
  }
}
