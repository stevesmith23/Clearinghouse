import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { addConsent } from "@/app/actions/drivers"
import Link from "next/link"
import { ClipboardCheck, ArrowLeft } from "lucide-react"

export const dynamic = 'force-dynamic';

export default async function NewConsentPage({ searchParams }: { searchParams: Promise<{ driverId?: string }> }) {
    const params = await searchParams;
    const drivers = await prisma.driver.findMany({
        orderBy: { lastName: 'asc' },
        include: {
            company: { select: { id: true, name: true } }
        }
    })

    return (
        <div className="p-8 sm:p-12 mb-20 bg-white min-h-full max-w-3xl mx-auto">
            <div className="mb-6">
                <Link href="/consents" className="text-sm font-medium text-[#3E91DE] hover:text-[#143A82] flex items-center gap-1 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Consents
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-[#77C7EC]/10 rounded-lg text-[#3E91DE]">
                            <ClipboardCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Log New Consent</CardTitle>
                            <CardDescription>Record a general or pre-employment consent form for a driver.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form action={addConsent} className="space-y-6">
                        <div className="space-y-5">
                            <div className="grid gap-2">
                                <Label htmlFor="driverId">Select Driver <span className="text-red-500">*</span></Label>
                                <select
                                    id="driverId"
                                    name="driverId"
                                    required
                                    defaultValue={params.driverId || ""}
                                    className="flex h-10 w-full rounded-md border border-[#77C7EC]/40 bg-white px-3 py-2 text-sm text-[#143A82] shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3E91DE]"
                                >
                                    <option value="" disabled>Select a driver...</option>
                                    {drivers.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.lastName}, {d.firstName} — {d.company.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#77C7EC]/20 pt-4 mt-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Consent Type <span className="text-red-500">*</span></Label>
                                    <select
                                        id="type"
                                        name="type"
                                        required
                                        className="flex h-10 w-full rounded-md border border-[#77C7EC]/40 bg-white px-3 py-2 text-sm text-[#143A82] shadow-sm"
                                    >
                                        <option value="LIMITED">Limited (General / Annual)</option>
                                        <option value="FULL">Full (Pre-Employment)</option>
                                    </select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="validUntil">Valid Until (Optional)</Label>
                                    <Input id="validUntil" name="validUntil" type="date" className="h-10" />
                                    <p className="text-xs text-slate-500">Leave blank for indefinite consent.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-[#77C7EC]/20">
                            <Link href={params.driverId ? `/drivers/${params.driverId}` : "/consents"}>
                                <Button variant="outline" type="button">Cancel</Button>
                            </Link>
                            <Button type="submit">Log Consent</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
