export type DataItem = {
    id: number
    name: string
    value: number
    category: string
    date: string
}

export async function fetchData(date: Date, type: String): Promise<DataItem[]> {
    const sampleData: DataItem[] = [
        { id: 1, name: 'Item 1', value: 100, category: 'A', date: '2023-05-01' },
        { id: 2, name: 'Item 2', value: 200, category: 'B', date: '2023-05-02' },
        { id: 3, name: 'Item 3', value: 300, category: 'A', date: '2023-05-03' },
        { id: 4, name: 'Item 4', value: 400, category: 'C', date: '2023-05-04' },
        { id: 5, name: 'Item 5', value: 500, category: 'B', date: '2023-05-05' },
        { id: 6, name: 'Item 6', value: 600, category: 'C', date: '2023-05-06' },
        { id: 7, name: 'Item 7', value: 700, category: 'A', date: '2023-05-07' },
        { id: 8, name: 'Item 8', value: 800, category: 'B', date: '2023-05-08' },
        { id: 9, name: 'Item 9', value: 900, category: 'C', date: '2023-05-09' },
        { id: 10, name: 'Item 10', value: 1000, category: 'A', date: '2023-05-10' },
    ]
    return sampleData
}