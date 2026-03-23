import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createCompany } from "@/app/actions/companies"
import Link from "next/link"
import { Building2, ArrowLeft } from "lucide-react"

export default function NewCompanyPage() {
    return (
        <div className="p-8 sm:p-12 mb-20 bg-white dark:bg-slate-900 min-h-full max-w-3xl mx-auto">
            <div className="mb-6">
                <Link href="/companies" className="text-sm font-medium text-[#3E91DE] hover:text-[#143A82] flex items-center gap-1 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Companies
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-[#77C7EC]/10 rounded-lg text-[#3E91DE]">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Add New Company</CardTitle>
                            <CardDescription>Register a new TPA client to manage their drivers and queries.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form action={createCompany} className="space-y-6">
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Company Name <span className="text-red-500">*</span></Label>
                                <Input id="name" name="name" placeholder="e.g. Acme Trucking LLC" required />
                            </div>

                            <div className="grid gap-2 relative">
                                <Label htmlFor="dotNumber">DOT Number</Label>
                                <Input id="dotNumber" name="dotNumber" placeholder="e.g. 1234567" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Primary DER Email</Label>
                                    <Input id="email" name="email" type="email" placeholder="primary@company.com" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" name="phone" type="tel" placeholder="(555) 123-4567" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="additionalEmails">Additional DER Emails</Label>
                                <textarea
                                    id="additionalEmails"
                                    name="additionalEmails"
                                    placeholder="Enter additional email addresses, one per line"
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-[#77C7EC]/40 bg-white text-sm text-[#143A82] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3E91DE]/40 focus:border-[#3E91DE] transition-all resize-none"
                                />
                                <p className="text-xs text-[#3E91DE]/70">For companies with multiple DERs. One email per line.</p>
                            </div>

                            <div className="grid gap-2 border-t border-[#77C7EC]/20 pt-4 mt-2">
                                <Label htmlFor="queryBalance">Initial Query Balance</Label>
                                <p className="text-xs text-[#3E91DE]/80 mb-1">
                                    How many query credits are currently purchased and available for this company?
                                </p>
                                <Input id="queryBalance" name="queryBalance" type="number" defaultValue="0" min="0" className="w-32" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-[#77C7EC]/20">
                            <Link href="/companies">
                                <Button variant="outline" type="button">Cancel</Button>
                            </Link>
                            <Button type="submit">Create Company</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
