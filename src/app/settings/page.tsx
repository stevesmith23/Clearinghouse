import { getSettings, updateSettings, updateReminderThresholds, updateLowBalanceThreshold, updateSmtpConfig, updatePasswordPolicy, getSessionHistory } from "@/app/actions/settings"
import { getEmailTemplates } from "@/app/actions/email-templates"
import EmailTemplateEditor from "./EmailTemplateEditor"
import { Settings, Save, Mail, Users, ArrowRight, Bell, Shield, Clock, Lock, Server, FileText, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { format } from "date-fns"

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
                <p className="text-[#3E91DE] mt-1">Configure global application settings and preferences.</p>
            </div>

            <div className="space-y-6">
                {/* Notification Emails */}
                <Card className="dark:bg-slate-900 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2 dark:text-white">
                            <Mail className="w-5 h-5 text-[#3E91DE]" />
                            Notification Preferences
                        </CardTitle>
                        <CardDescription>Manage where automated system alerts and cron job summaries are sent.</CardDescription>
                    </CardHeader>
                    <form action={updateSettings}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="notificationEmail" className="font-semibold text-[#143A82] dark:text-white">System Alert Emails</Label>
                                <textarea
                                    id="notificationEmail"
                                    name="notificationEmail"
                                    placeholder={"admin@clearinghousegroup.com\nmanager@clearinghousegroup.com"}
                                    defaultValue={settings.notificationEmail || ""}
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-[#77C7EC]/40 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-[#143A82] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3E91DE]/40 focus:border-[#3E91DE] transition-all resize-none"
                                />
                                <p className="text-xs text-slate-500">Enter one email per line. All high-priority alerts will be sent to all listed addresses.</p>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 py-4 flex justify-end">
                            <Button type="submit"><Save className="w-4 h-4 mr-2" /> Save</Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Auto-Reminder Thresholds */}
                <Card className="dark:bg-slate-900 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2 dark:text-white">
                            <Bell className="w-5 h-5 text-amber-500" />
                            Auto-Reminder Thresholds
                        </CardTitle>
                        <CardDescription>Configure how many days before a deadline the system generates warnings on the dashboard and calendar.</CardDescription>
                    </CardHeader>
                    <form action={updateReminderThresholds}>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="consentExpiryWarningDays" className="font-semibold text-[#143A82] dark:text-white">Consent Expiry Warning</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="consentExpiryWarningDays"
                                            name="consentExpiryWarningDays"
                                            type="number"
                                            min="1"
                                            max="365"
                                            defaultValue={settings.consentExpiryWarningDays}
                                            className="w-24 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                                        />
                                        <span className="text-sm text-slate-500">days before expiry</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bulkQueryWarningDays" className="font-semibold text-[#143A82] dark:text-white">Bulk Query Due Warning</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="bulkQueryWarningDays"
                                            name="bulkQueryWarningDays"
                                            type="number"
                                            min="1"
                                            max="365"
                                            defaultValue={settings.bulkQueryWarningDays}
                                            className="w-24 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                                        />
                                        <span className="text-sm text-slate-500">days before due date</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 py-4 flex justify-end">
                            <Button type="submit"><Save className="w-4 h-4 mr-2" /> Save</Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Low Balance Threshold */}
                <Card className="dark:bg-slate-900 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2 dark:text-white">
                            <Shield className="w-5 h-5 text-red-500" />
                            Low Query Balance Threshold
                        </CardTitle>
                        <CardDescription>Set the minimum query credit balance before the system flags a company as needing more credits.</CardDescription>
                    </CardHeader>
                    <form action={updateLowBalanceThreshold}>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="lowBalanceThreshold" className="font-semibold text-[#143A82] dark:text-white">Warning when balance falls below</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="lowBalanceThreshold"
                                        name="lowBalanceThreshold"
                                        type="number"
                                        min="1"
                                        max="100"
                                        defaultValue={settings.lowBalanceThreshold}
                                        className="w-24 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                                    />
                                    <span className="text-sm text-slate-500">query credits</span>
                                </div>
                                <p className="text-xs text-slate-500">Companies with fewer credits than their active driver count will also be flagged regardless of this threshold.</p>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 py-4 flex justify-end">
                            <Button type="submit"><Save className="w-4 h-4 mr-2" /> Save</Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Email Templates */}
                <Card className="dark:bg-slate-900 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2 dark:text-white">
                            <FileText className="w-5 h-5 text-indigo-500" />
                            Email Templates
                        </CardTitle>
                        <CardDescription>Click a template to edit its subject line and HTML body. Use {"{{variables}}"} for dynamic content.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EmailTemplateEditor templates={emailTemplates.map(t => ({
                            id: t.id,
                            slug: t.slug,
                            name: t.name,
                            subject: t.subject,
                            body: t.body,
                            description: t.description,
                        }))} />
                    </CardContent>
                </Card>

                {/* SMTP Configuration */}
                <Card className="dark:bg-slate-900 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2 dark:text-white">
                            <Server className="w-5 h-5 text-emerald-500" />
                            SMTP / Email Configuration
                        </CardTitle>
                        <CardDescription>Configure outbound email settings. These are used for all automated emails.</CardDescription>
                    </CardHeader>
                    <form action={updateSmtpConfig}>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="smtpHost" className="font-semibold text-[#143A82] dark:text-white">SMTP Host</Label>
                                    <Input id="smtpHost" name="smtpHost" defaultValue={settings.smtpHost || ""} placeholder="smtp.sendgrid.net" className="dark:bg-slate-800 dark:border-slate-600 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtpPort" className="font-semibold text-[#143A82] dark:text-white">SMTP Port</Label>
                                    <Input id="smtpPort" name="smtpPort" type="number" defaultValue={settings.smtpPort || 587} placeholder="587" className="dark:bg-slate-800 dark:border-slate-600 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtpUser" className="font-semibold text-[#143A82] dark:text-white">Username / API Key</Label>
                                    <Input id="smtpUser" name="smtpUser" defaultValue={settings.smtpUser || ""} placeholder="apikey" className="dark:bg-slate-800 dark:border-slate-600 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtpPass" className="font-semibold text-[#143A82] dark:text-white">Password / Secret</Label>
                                    <Input id="smtpPass" name="smtpPass" type="password" defaultValue={settings.smtpPass || ""} placeholder="••••••••" className="dark:bg-slate-800 dark:border-slate-600 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtpFromEmail" className="font-semibold text-[#143A82] dark:text-white">From Email</Label>
                                    <Input id="smtpFromEmail" name="smtpFromEmail" type="email" defaultValue={settings.smtpFromEmail || ""} placeholder="noreply@clearinghousegroup.com" className="dark:bg-slate-800 dark:border-slate-600 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtpFromName" className="font-semibold text-[#143A82] dark:text-white">From Name</Label>
                                    <Input id="smtpFromName" name="smtpFromName" defaultValue={settings.smtpFromName || ""} placeholder="ClearinghouseGroup" className="dark:bg-slate-800 dark:border-slate-600 dark:text-white" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 py-4 flex justify-end">
                            <Button type="submit"><Save className="w-4 h-4 mr-2" /> Save</Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Password Policy */}
                <Card className="dark:bg-slate-900 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2 dark:text-white">
                            <Lock className="w-5 h-5 text-purple-500" />
                            Password Policy
                        </CardTitle>
                        <CardDescription>Set requirements for user passwords. Changes apply to new passwords only.</CardDescription>
                    </CardHeader>
                    <form action={updatePasswordPolicy}>
                        <CardContent>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="passwordMinLength" className="font-semibold text-[#143A82] dark:text-white">Minimum Password Length</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="passwordMinLength"
                                            name="passwordMinLength"
                                            type="number"
                                            min="6"
                                            max="32"
                                            defaultValue={settings.passwordMinLength}
                                            className="w-24 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                                        />
                                        <span className="text-sm text-slate-500">characters</span>
                                    </div>
                                </div>
                                <div className="space-y-3 pl-1">
                                    <div className="flex items-center gap-3">
                                        <input
                                            id="passwordRequireUppercase"
                                            name="passwordRequireUppercase"
                                            type="checkbox"
                                            defaultChecked={settings.passwordRequireUppercase}
                                            className="w-4 h-4 text-[#3E91DE] border-slate-300 rounded focus:ring-[#3E91DE]"
                                        />
                                        <Label htmlFor="passwordRequireUppercase" className="text-sm text-slate-700 dark:text-slate-300">Require at least one uppercase letter (A–Z)</Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            id="passwordRequireNumber"
                                            name="passwordRequireNumber"
                                            type="checkbox"
                                            defaultChecked={settings.passwordRequireNumber}
                                            className="w-4 h-4 text-[#3E91DE] border-slate-300 rounded focus:ring-[#3E91DE]"
                                        />
                                        <Label htmlFor="passwordRequireNumber" className="text-sm text-slate-700 dark:text-slate-300">Require at least one number (0–9)</Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            id="passwordRequireSpecial"
                                            name="passwordRequireSpecial"
                                            type="checkbox"
                                            defaultChecked={settings.passwordRequireSpecial}
                                            className="w-4 h-4 text-[#3E91DE] border-slate-300 rounded focus:ring-[#3E91DE]"
                                        />
                                        <Label htmlFor="passwordRequireSpecial" className="text-sm text-slate-700 dark:text-slate-300">Require at least one special character (!@#$%^&*)</Label>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 py-4 flex justify-end">
                            <Button type="submit"><Save className="w-4 h-4 mr-2" /> Save</Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* User Management */}
                <Card className="dark:bg-slate-900 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2 dark:text-white">
                            <Users className="w-5 h-5 text-[#3E91DE]" />
                            User Management
                        </CardTitle>
                        <CardDescription>Create and manage system users and their permissions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link
                            href="/settings/users"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3E91DE] hover:bg-[#143A82] text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
                        >
                            Manage Users <ArrowRight className="w-4 h-4" />
                        </Link>
                    </CardContent>
                </Card>

                {/* Session History */}
                <Card className="dark:bg-slate-900 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2 dark:text-white">
                            <Clock className="w-5 h-5 text-cyan-500" />
                            Session History
                        </CardTitle>
                        <CardDescription>Recent login activity for all users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* User last logins */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">User Last Logins</h4>
                                <div className="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                    {users.map((u) => (
                                        <div key={u.id} className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${u.role === "ADMIN" ? "bg-[#3E91DE]/15 text-[#143A82] dark:text-[#3E91DE]" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"}`}>
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-[#143A82] dark:text-white">{u.name}</p>
                                                    <p className="text-xs text-slate-400">{u.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {u.lastLoginAt ? format(new Date(u.lastLoginAt), "MMM d, yyyy h:mm a") : "Never logged in"}
                                                </p>
                                                {u.lastLoginIp && (
                                                    <p className="text-[10px] text-slate-400 font-mono">{u.lastLoginIp}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Login Attempts */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Recent Login Attempts</h4>
                                {recentAttempts.length === 0 ? (
                                    <p className="text-sm text-slate-400 pl-2">No login attempts recorded yet.</p>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                        {recentAttempts.map((a) => (
                                            <div key={a.id} className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-800">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full shrink-0 ${a.success ? "bg-emerald-500" : "bg-red-500"}`} />
                                                    <div>
                                                        <p className="text-sm text-[#143A82] dark:text-white font-mono">{a.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${a.success ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>
                                                        {a.success ? "SUCCESS" : "FAILED"}
                                                    </span>
                                                    <span className="text-xs text-slate-400">{format(new Date(a.createdAt), "MMM d, h:mm a")}</span>
                                                    {a.ipAddress && <span className="text-[10px] text-slate-400 font-mono">{a.ipAddress}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
