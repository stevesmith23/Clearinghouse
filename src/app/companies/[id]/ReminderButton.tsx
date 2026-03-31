"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, ShoppingCart, ChevronDown, Calendar, Clock, X, Send } from "lucide-react"
import { sendBuyQueriesReminder, sendUpdateRosterReminder, scheduleReminder } from "@/app/actions/companies"

export function ReminderButton({ companyId, hasEmail, type, hasDeadline }: { companyId: string, hasEmail: boolean, type: "buy-queries" | "update-roster", hasDeadline: boolean }) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [isOpen, setIsOpen] = useState(false)
    const [dateValue, setDateValue] = useState("")
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSendNow = async () => {
        if (!hasEmail) {
            alert("This company does not have an email address on file. Please edit their profile to add one.")
            return;
        }

        setStatus("loading")
        setIsOpen(false)
        try {
            const res = type === "buy-queries" ? await sendBuyQueriesReminder(companyId) : await sendUpdateRosterReminder(companyId)
            if (res.success) {
                setStatus("success")
                setTimeout(() => setStatus("idle"), 3000)
            } else {
                setStatus("error")
                alert(res.message)
                setTimeout(() => setStatus("idle"), 3000)
            }
        } catch (error) {
            console.error(error)
            setStatus("error")
            alert("An unexpected error occurred.")
            setTimeout(() => setStatus("idle"), 3000)
        }
    }

    const handleSchedule = async (scheduleType: "date" | "10-days" | "clear") => {
        if (scheduleType === "date" && !dateValue) {
            alert("Please select a date first.")
            return;
        }

        setStatus("loading")
        setIsOpen(false)
        try {
            const res = await scheduleReminder(companyId, type, scheduleType, dateValue)
            if (res.success) {
                setStatus("success")
                setTimeout(() => setStatus("idle"), 3000)
            } else {
                setStatus("error")
                alert(res.message)
                setTimeout(() => setStatus("idle"), 3000)
            }
        } catch (error) {
            console.error(error)
            setStatus("error")
            alert("Failed to save schedule.")
            setTimeout(() => setStatus("idle"), 3000)
        }
    }

    const Icon = type === "buy-queries" ? ShoppingCart : RefreshCw;
    const buttonText = type === "buy-queries" ? "Request Query Plans" : "Request i3 Update";

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <Button
                size="sm"
                variant="outline"
                className="text-[#3E91DE] border-[#3E91DE]/30 hover:bg-[#3E91DE]/5 pr-1.5"
                onClick={() => setIsOpen(!isOpen)}
                disabled={status === "loading" || status === "success"}
            >
                <Icon className="w-4 h-4 mr-1" />
                {status === "loading" ? "Processing..." : status === "success" ? "Saved!" : buttonText}
                <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
            </Button>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 divide-y divide-gray-100">
                    <div className="py-2">
                        <button
                            onClick={handleSendNow}
                            className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 hover:text-[#143A82] dark:text-white"
                        >
                            <Send className="mr-3 h-4 w-4 text-gray-400 group-hover:text-[#3E91DE]" />
                            Send Now
                        </button>
                    </div>

                    <div className="py-2 px-4">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Automate</div>

                        {hasDeadline && (
                            <button
                                onClick={() => handleSchedule("10-days")}
                                className="group flex items-center w-full py-2 text-sm text-gray-700 hover:text-[#143A82] dark:text-white"
                            >
                                <Clock className="mr-3 h-4 w-4 text-gray-400 group-hover:text-[#3E91DE]" />
                                Send 10 days before deadline
                            </button>
                        )}

                        <div className="flex flex-col gap-2 mt-2">
                            <label className="text-sm text-gray-700 flex items-center">
                                <Calendar className="mr-3 h-4 w-4 text-gray-400" />
                                Schedule for specific date
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    className="flex-1 text-sm rounded border border-gray-300 px-2 py-1"
                                    value={dateValue}
                                    onChange={(e) => setDateValue(e.target.value)}
                                />
                                <Button size="sm" onClick={() => handleSchedule("date")} className="h-auto">
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="py-2">
                        <button
                            onClick={() => handleSchedule("clear")}
                            className="group flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                            <X className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-600" />
                            Clear existing schedule
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
