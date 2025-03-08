import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Language, ToplistType } from '@/lib/types'

interface TypeSelectProps {
    type: ToplistType
    onSelectChange: (type: ToplistType) => void
    language: Language
}

export function TypeSelect({ type, onSelectChange, language = 'en' }: TypeSelectProps) {
  const translations = {
    en: {
      placeholder: 'select toplist type',
      day: 'Yesterday',
      month: 'Past Month',
      year: 'Past Year',
      all: 'All-Time',
    },
    zh: {
      placeholder: '选择排行榜类型',
      day: '昨天',
      month: '过去一个月',
      year: '过去一年',
      all: '所有时间',
    },
  }

  const t = translations[language]

  return (
    <Select value={type} onValueChange={onSelectChange}>
      <SelectTrigger className="w-[180px] bg-zinc-50 dark:bg-zinc-800">
        <SelectValue placeholder={t.placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-zinc-50 dark:bg-zinc-800">
        <SelectItem value="day" className="dark:hover:bg-zinc-700 dark:data-[highlighted]:bg-zinc-700">{t.day}</SelectItem>
        <SelectItem value="month" className="dark:hover:bg-zinc-700 dark:data-[highlighted]:bg-zinc-700">{t.month}</SelectItem>
        <SelectItem value="year" className="dark:hover:bg-zinc-700 dark:data-[highlighted]:bg-zinc-700">{t.year}</SelectItem>
        <SelectItem value="all" className="dark:hover:bg-zinc-700 dark:data-[highlighted]:bg-zinc-700">{t.all}</SelectItem>
      </SelectContent>
    </Select>
  )
}
