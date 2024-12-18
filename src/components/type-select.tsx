// TODO: 中文

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface TypeSelectProps {
    type: string
    onSelectChange: (type: string) => void
}

export function TypeSelect({ type, onSelectChange }: TypeSelectProps) {
    return (
        <Select value={type} onValueChange={onSelectChange}>
            <SelectTrigger className="w-[180px] bg-zinc-50 dark:bg-zinc-800">
                <SelectValue placeholder="select toplist type" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-50 dark:bg-zinc-800">
                <SelectItem value="day" className="dark:hover:bg-zinc-700 dark:data-[highlighted]:bg-zinc-700">Galleries Yesterday</SelectItem>
                <SelectItem value="month" className="dark:hover:bg-zinc-700 dark:data-[highlighted]:bg-zinc-700">Galleries Past Month</SelectItem>
                <SelectItem value="year" className="dark:hover:bg-zinc-700 dark:data-[highlighted]:bg-zinc-700">Galleries Past Year</SelectItem>
                <SelectItem value="all" className="dark:hover:bg-zinc-700 dark:data-[highlighted]:bg-zinc-700">Galleries All-Time</SelectItem>
            </SelectContent>
        </Select>
    )
}
