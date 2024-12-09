import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface TypeSelectProps {
    onSelectChange: (type: string) => void
}

export function TypeSelect({ onSelectChange }: TypeSelectProps) {
    return (
        <Select onValueChange={onSelectChange}>
            <SelectTrigger className="w-[180px] bg-gray-50 dark:bg-gray-950">
                <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent className="bg-gray-50 dark:bg-gray-950">
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
            </SelectContent>
        </Select>
    )
}
