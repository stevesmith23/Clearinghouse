import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CompaniesTable } from "./CompaniesTable"

export const dynamic = 'force-dynamic';

export default async function CompaniesPage() {
    const companies = await prisma.company.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { drivers: true }
            }
        }
    })

    return (
        <div className="p-8 sm:p-12 mb-20 bg-white min-h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#143A82]">Companies</h1>
                    <p className="text-[#3E91DE] mt-1">Manage all TPA clients and their query balances.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/companies/import">
                        <Button variant="outline" className="shadow-sm">
                            <Upload className="w-4 h-4 mr-1" />
                            Import from Spreadsheet
                        </Button>
                    </Link>
                    <Link href="/companies/new">
                        <Button className="shadow-sm">
                            <Plus className="w-4 h-4 mr-1" />
                            Add Company
                        </Button>
                    </Link>
                </div>
            </div>

            <CompaniesTable companies={companies} />
        </div>
    )
}
