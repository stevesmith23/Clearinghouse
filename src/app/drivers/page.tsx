import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import DriversTable from "./DriversTable"

export const dynamic = 'force-dynamic';

export default async function DriversPage() {
    const drivers = await prisma.driver.findMany({
        orderBy: { lastName: 'asc' },
        include: {
            company: { select: { name: true, id: true } },
            consents: { where: { status: 'ACTIVE' }, select: { id: true } }
        }
    })

    return (
        <div className="p-8 sm:p-12 mb-20 bg-white dark:bg-slate-900 min-h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#143A82] dark:text-white">Drivers</h1>
                    <p className="text-[#3E91DE] dark:text-slate-400 mt-1">Manage all drivers across your companies.</p>
                </div>
                <Link href="/drivers/new">
                    <Button className="shadow-sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Driver
                    </Button>
                </Link>
            </div>

            <DriversTable drivers={drivers} />
        </div>
    )
}
