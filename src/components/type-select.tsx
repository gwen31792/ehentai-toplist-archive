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
            <SelectTrigger className="w-[180px] bg-gray-50 dark:bg-gray-800">
                <SelectValue placeholder="select toplist type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-50 dark:bg-gray-800">
                <SelectItem value="day" className="dark:hover:bg-gray-700 dark:data-[highlighted]:bg-gray-700">Galleries Yesterday</SelectItem>
                <SelectItem value="month" className="dark:hover:bg-gray-700 dark:data-[highlighted]:bg-gray-700">Galleries Past Month</SelectItem>
                <SelectItem value="year" className="dark:hover:bg-gray-700 dark:data-[highlighted]:bg-gray-700">Galleries Past Year</SelectItem>
                <SelectItem value="all" className="dark:hover:bg-gray-700 dark:data-[highlighted]:bg-gray-700">Galleries All-Time</SelectItem>
            </SelectContent>
        </Select>
    )
}
