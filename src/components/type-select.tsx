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
                <SelectItem value="day">Galleries Yesterday</SelectItem>
                <SelectItem value="month">Galleries Past Month</SelectItem>
                <SelectItem value="year">Galleries Past Year</SelectItem>
                <SelectItem value="all">Galleries All-Time</SelectItem>
            </SelectContent>
        </Select>
    )
}
