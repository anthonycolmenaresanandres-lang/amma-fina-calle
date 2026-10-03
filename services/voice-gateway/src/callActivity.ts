// Conservative response evidence from existing events: no transcript or semantic grading.
// Sending audio is not proof it was heard or resolved the caller's question.
export class ReplyAudioEvidence {
  private callerTurnSeen = false;
  private eligibleResponses = new Set<string>();

  callerTurnStopped(): void { this.callerTurnSeen = true; }

  responseCreated(response: { id?: unknown; metadata?: unknown }): void {
    const metadata = response.metadata as { gatewayPurpose?: unknown } | null | undefined;
    if (this.callerTurnSeen && typeof response.id === "string" &&
        metadata?.gatewayPurpose !== "greeting" && metadata?.gatewayPurpose !== "wrap_up") {
      this.eligibleResponses.add(response.id);
    }
  }

  isReply(responseId: unknown): boolean {
    return typeof responseId === "string" && this.eligibleResponses.has(responseId);
  }

  responseDone(responseId: unknown): void {
    if (typeof responseId === "string") this.eligibleResponses.delete(responseId);
  }

  cancel(): void { this.eligibleResponses.clear(); }
}
