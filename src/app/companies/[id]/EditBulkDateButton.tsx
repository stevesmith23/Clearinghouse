"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { updateBulkQueryDate } from "@/app/actions/companies"

export function EditBulkDateButton({ companyId, initialDate }: { companyId: string, initialDate: Date | null }) {
    const [date, setDate] = useState<Date | undefined>(initialDate || undefined)
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)

    async function handleSave() {
        if (!date) return;
        setIsPending(true)
        const formData = new FormData()
        formData.append("date", date.toISOString())

        try {
            await updateBulkQueryDate(companyId, formData)
            setIsOpen(false)
        } catch (error) {
            console.error("Failed to update date", error)
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1 text-[#3E91DE] hover:text-[#143A82] hover:bg-[#77C7EC]/10">
                    <Edit2 className="h-3 w-3" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
                <div className="space-y-4">
                    <h4 className="font-medium text-sm text-[#143A82]">Set Last Bulk Query Date</h4>
                    <p className="text-xs text-slate-500">
                        This sets the base date. The next due date will automatically calculate to 365 days from this selection.
                    </p>
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        className="rounded-md border border-slate-100"
                    />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={!date || isPending}>
                            {isPending ? "Saving..." : "Save Date"}
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
