import { getSettings, updateSettings, updateReminderThresholds, updateLowBalanceThreshold, updateSmtpConfig, updatePasswordPolicy, getSessionHistory } from "@/app/actions/settings"
import { getEmailTemplates } from "@/app/actions/email-templates"
import { Settings } from "lucide-react"
import SettingsTabs from "./SettingsTabs"

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const settings = await getSettings();
    const { users, recentAttempts } = await getSessionHistory();
    const emailTemplates = await getEmailTemplates();

    return (
        <div className="p-8 sm:p-12 mb-20 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-[#143A82] dark:text-white flex items-center gap-3">
                    <Settings className="w-8 h-8 text-[#3E91DE]" />
                    Settings
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Configure global application settings and preferences.</p>
            </div>

            <SettingsTabs
                settings={settings}
                users={users}
                recentAttempts={recentAttempts}
                emailTemplates={emailTemplates.map(t => ({
                    id: t.id,
                    slug: t.slug,
                    name: t.name,
                    subject: t.subject,
                    body: t.body,
                    description: t.description,
                }))}
                actions={{
                    updateSettings,
                    updateReminderThresholds,
                    updateLowBalanceThreshold,
                    updateSmtpConfig,
                    updatePasswordPolicy,
                }}
            />
        </div>
    )
}
