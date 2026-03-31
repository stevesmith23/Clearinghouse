import * as React from "react"

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
    ({ className = '', ...props }, ref) => (
        <div className="relative w-full overflow-auto">
            <table
                ref={ref}
                className={`w-full caption-bottom text-sm ${className}`}
                {...props}
            />
        </div>
    )
)
Table.displayName = "Table"

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
    ({ className = '', ...props }, ref) => (
        <thead ref={ref} className={`[&_tr]:border-b [&_tr]:border-[#77C7EC]/20 dark:[&_tr]:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 ${className}`} {...props} />
    )
)
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
    ({ className = '', ...props }, ref) => (
        <tbody
            ref={ref}
            className={`[&_tr:last-child]:border-0 [&_tr]:border-[#77C7EC]/10 dark:[&_tr]:border-slate-700/50 ${className}`}
            {...props}
        />
    )
)
TableBody.displayName = "TableBody"

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
    ({ className = '', ...props }, ref) => (
        <tr
            ref={ref}
            className={`border-b transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-700/30 data-[state=selected]:bg-slate-50 dark:data-[state=selected]:bg-slate-700 ${className}`}
            {...props}
        />
    )
)
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
    ({ className = '', ...props }, ref) => (
        <th
            ref={ref}
            className={`h-12 px-4 text-left align-middle font-medium text-[#3E91DE] dark:text-[#77C7EC] [&:has([role=checkbox])]:pr-0 ${className}`}
            {...props}
        />
    )
)
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
    ({ className = '', ...props }, ref) => (
        <td
            ref={ref}
            className={`p-4 align-middle text-[#143A82] dark:text-slate-200 [&:has([role=checkbox])]:pr-0 ${className}`}
            {...props}
        />
    )
)
TableCell.displayName = "TableCell"

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell }
