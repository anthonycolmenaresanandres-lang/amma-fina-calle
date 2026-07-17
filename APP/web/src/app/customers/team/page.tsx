import { Mail, ShieldCheck, UserRoundCheck, Users } from "lucide-react";
import { getAdminContext } from "@/lib/admin/auth";
import { getTeamRoster } from "@/lib/admin/team";
import { setTeamMemberStatus } from "@/lib/admin/team-actions";
import {
  Button,
  Eyebrow,
  Lede,
  PageShell,
  PageTitle,
  Panel,
  SectionHeading,
  SignOutButton,
  StatusPill,
  TopBar,
} from "@/components/ui";
import AdminGate from "../AdminGate";
import TeamMemberForm from "./TeamMemberForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Team Access | Fina Calle OS",
  description: "AMMA employee access and onboarding controls.",
};

export default async function TeamAccessPage() {
  const admin = await getAdminContext();
  if (admin.state !== "authorized") return <AdminGate ctx={admin} />;

  const team = await getTeamRoster();
  return (
    <PageShell>
      <TopBar backHref="/customers" backLabel="Client Ledger">
        <SignOutButton />
      </TopBar>

      <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:py-14">
        <div className="lg:sticky lg:top-10">
          <Eyebrow>AMMA Operations</Eyebrow>
          <PageTitle>Team Access</PageTitle>
          <Lede>Know who works inside the client ledger and control their sign-in access.</Lede>
          <ol className="mt-7 space-y-3 text-sm leading-6 text-[#aeb7bd]">
            <li><strong className="text-[#eef2f4]">1.</strong> Anthony authorizes the employee&apos;s exact email.</li>
            <li><strong className="text-[#eef2f4]">2.</strong> The employee visits <span className="text-[#bfdcff]">/customers</span>.</li>
            <li><strong className="text-[#eef2f4]">3.</strong> They enter that email and open the one-time link.</li>
            <li><strong className="text-[#eef2f4]">4.</strong> Deactivate access here when they leave.</li>
          </ol>
        </div>

        <div className="space-y-5">
          {admin.canManageTeam ? (
            <Panel>
              <SectionHeading tone="accent" icon={<UserRoundCheck size={13} aria-hidden />}>
                Authorize a New Employee
              </SectionHeading>
              <p className="mt-3 text-sm leading-6 text-[#8f9aa1]">
                This adds internal ledger access. It does not give restaurant-owner access,
                banking access, Stripe access, or permission to manage other employees.
              </p>
              <TeamMemberForm />
            </Panel>
          ) : (
            <Panel>
              <SectionHeading tone="accent" icon={<ShieldCheck size={13} aria-hidden />}>
                Owner-controlled
              </SectionHeading>
              <p className="mt-3 text-sm leading-6 text-[#aeb7bd]">
                You can view the roster. Only the AMMA owner can add or deactivate employees.
              </p>
            </Panel>
          )}

          <Panel>
            <SectionHeading
              tone="accent"
              icon={<Users size={13} aria-hidden />}
              hint={`${team.length} ${team.length === 1 ? "person" : "people"}`}
            >
              Authorized Team
            </SectionHeading>
            <div className="mt-5 grid gap-3">
              {team.length === 0 ? (
                <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm leading-6 text-[#8f9aa1]">
                  The roster will appear after migration 0011 is reviewed and applied.
                </p>
              ) : null}
              {team.map((member) => (
                <article
                  key={member.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-[#eef2f4]">
                        {member.displayName || member.email}
                      </h3>
                      <StatusPill tone={member.isActive ? "success" : "danger"} dot>
                        {member.isActive ? "Active" : "Inactive"}
                      </StatusPill>
                      {member.canManageTeam ? <StatusPill tone="gold">Owner</StatusPill> : null}
                    </div>
                    <p className="mt-1 text-sm text-[#aeb7bd]">{member.jobTitle}</p>
                    <p className="mt-1 flex items-center gap-1.5 break-all text-xs text-[#7f8a91]">
                      <Mail size={11} aria-hidden /> {member.email}
                    </p>
                  </div>
                  {admin.canManageTeam && !member.canManageTeam ? (
                    <form
                      action={setTeamMemberStatus.bind(null, member.email, !member.isActive)}
                    >
                      <Button type="submit" variant={member.isActive ? "danger" : "success"}>
                        {member.isActive ? "Deactivate" : "Reactivate"}
                      </Button>
                    </form>
                  ) : null}
                </article>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </PageShell>
  );
}
