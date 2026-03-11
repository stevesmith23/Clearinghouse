import { getSettings } from "@/app/actions/settings"
import { updateSettings } from "@/app/actions/settings"
import { Settings, Save, Mail, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import Link from "next/link"

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const settings = await getSettings();

    return (
        <div className="p-8 sm:p-12 mb-20 bg-white min-h-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-[#143A82] flex items-center gap-3">
                    <Settings className="w-8 h-8 text-[#3E91DE]" />
                    Settings
                </h1>
                <p className="text-[#3E91DE] mt-1">Configure global application settings and preferences.</p>
            </div>

            <div className="max-w-3xl space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Notification Preferences</CardTitle>
                        <CardDescription>
                            Manage where automated system alerts and cron job summaries are sent.
                        </CardDescription>
                    </CardHeader>
                    <form action={updateSettings}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="notificationEmail" className="font-semibold text-[#143A82]">System Alert Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="notificationEmail"
                                        name="notificationEmail"
                                        type="email"
                                        placeholder="e.g., admin@clearinghousegroup.com"
                                        defaultValue={settings.notificationEmail || ""}
                                        className="pl-9"
                                    />
                                </div>
                                <p className="text-xs text-slate-500">
                                    All high-priority alerts (like the 30-day Bulk Query approaching warnings and prohibited driver RTD alerts) will be explicitly routed here. If left blank, it defaults to your SMTP User.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 border-t border-slate-100 py-4 flex justify-end">
                            <Button type="submit">
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#3E91DE]" />
                            User Management
                        </CardTitle>
                        <CardDescription>
                            Create and manage system users and their permissions.
                        </CardDescription>
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
            </div>
        </div>
    )
}
