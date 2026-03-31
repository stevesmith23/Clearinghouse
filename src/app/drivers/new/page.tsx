import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createDriver } from "@/app/actions/drivers"
import Link from "next/link"
import { Users, ArrowLeft } from "lucide-react"

export const dynamic = 'force-dynamic';

export default async function NewDriverPage({ searchParams }: { searchParams: Promise<{ companyId?: string }> }) {
    const params = await searchParams;
    const companies = await prisma.company.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true }
    })

    return (
        <div className="p-8 sm:p-12 mb-20 bg-white dark:bg-slate-900 min-h-full max-w-3xl mx-auto">
            <div className="mb-6">
                <Link href="/drivers" className="text-sm font-medium text-[#3E91DE] hover:text-[#143A82] dark:text-white flex items-center gap-1 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Drivers
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-[#77C7EC]/10 rounded-lg text-[#3E91DE]">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Add New Driver</CardTitle>
                            <CardDescription>Enroll a driver under a managed company for query processing.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form action={createDriver} className="space-y-6">
                        <div className="space-y-4">

                            <div className="grid gap-2">
                                <Label htmlFor="companyId">Assign to Company <span className="text-red-500">*</span></Label>
                                <select
                                    id="companyId"
                                    name="companyId"
                                    required
                                    defaultValue={params.companyId || ""}
                                    className="flex h-10 w-full rounded-md border border-[#77C7EC]/40 bg-white px-3 py-2 text-sm text-[#143A82] dark:text-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3E91DE]"
                                >
                                    <option value="" disabled>Select a company...</option>
                                    {companies.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                                    <Input id="firstName" name="firstName" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                                    <Input id="lastName" name="lastName" required />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="cdlNumber">CDL Number <span className="text-red-500">*</span></Label>
                                    <Input id="cdlNumber" name="cdlNumber" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="cdlState">CDL State <span className="text-red-500">*</span></Label>
                                    <Input id="cdlState" name="cdlState" placeholder="e.g. TX" maxLength={2} required />
                                </div>
                            </div>

                            <div className="grid gap-2 pt-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Input id="dob" name="dob" type="date" className="w-1/2" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-[#77C7EC]/20">
                            <Link href={params.companyId ? `/companies/${params.companyId}` : "/drivers"}>
                                <Button variant="outline" type="button">Cancel</Button>
                            </Link>
                            <Button type="submit">Enroll Driver</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
