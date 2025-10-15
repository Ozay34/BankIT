import {useImportedData, useParsedData} from "../../data/ImportedData.js";
import {
    Group,
    Input, NumberInput,
    ScrollArea, Select,
    Stack,
    Switch,
    Table,
    TextInput, UnstyledButton
} from "@mantine/core";

const CSVExtractor = {
    Settings(){

        const header = useImportedData((state) => state.header);
        const setHeader = useImportedData((state) => state.setHeader);
        const delim = useImportedData((state) => state.delim);
        const setDelim = useImportedData((state) => state.setDelim);
        const columns = useParsedData((state) => state.getColumns());

        const dateColumn = useImportedData((state) => state.dateColumn);
        const descColumn = useImportedData((state) => state.descColumn);
        const expenseColumn = useImportedData((state) => state.expenseColumn);
        const incomeColumn = useImportedData((state) => state.incomeColumn);
        const dateFormat = useImportedData((state) => state.dateFormat);
        const negativeExpenses = useImportedData((state) => state.negativeExpenses);

        const setDateColumn = useImportedData((state) => state.setDateColumn);
        const setDescColumn = useImportedData((state) => state.setDescColumn);
        const setExpenseColumn = useImportedData((state) => state.setExpenseColumn);
        const setIncomeColumn = useImportedData((state) => state.setIncomeColumn);
        const setDateFormat = useImportedData((state) => state.setDateFormat);
        const setNegativeExpenses = useImportedData((state) => state.setNegativeExpenses);

        function setColumnByName(setColumn){
            return (name) => {
                setColumn(columns.indexOf(name))
            }
        }

        return (
            <Stack>
                <Group grow align="top">
                    <Input.Wrapper label="Header row">
                        <Switch size="md" checked={header} onChange={(e) => setHeader(e.currentTarget.checked)} />
                    </Input.Wrapper>
                    <TextInput label="Delimiter" placeholder="auto" onChange={(e) => setDelim(e.currentTarget.value)} value={delim} />
                </Group>
                <Group grow>
                    {header ?
                        <Select label="Date Column" data={columns} value={columns[dateColumn]} onChange={setColumnByName(setDateColumn)} /> :
                        <NumberInput label="Date Column" min={1} max={columns} value={dateColumn+1} onChange={(v) => setDateColumn(v-1)} />
                    }
                    <TextInput label={<UnstyledButton>Test</UnstyledButton>} placeholder="auto" value={dateFormat} onChange={(e) => setDateFormat(e.currentTarget.value)} />
                </Group>
                <Group grow>
                    {header ?
                        <Select label="Description Column" data={columns} value={columns[descColumn]}  onChange={setColumnByName(setDescColumn)} /> :
                        <NumberInput label="Description Column" min={1} max={columns} value={descColumn+1} onChange={(v) => setDescColumn(v-1)} />
                    }
                </Group>
                <Group grow>
                    {header ?
                        <Select label="Expense Column" data={columns} value={columns[expenseColumn]}  onChange={setColumnByName(setExpenseColumn)} /> :
                        <NumberInput label="Expense Column" min={1} max={columns} value={expenseColumn+1} onChange={(v) => setExpenseColumn(v-1)} />
                    }
                    <Input.Wrapper label="Negative">
                        <Switch size="md" checked={negativeExpenses} onChange={(e) => setNegativeExpenses(e.currentTarget.checked)} />
                    </Input.Wrapper>
                </Group>
                <Group grow>
                    {header ?
                        <Select label="Income Column" data={columns} value={columns[incomeColumn]}  onChange={setColumnByName(setIncomeColumn)} /> :
                        <NumberInput label="Income Column" min={1} max={columns} value={incomeColumn+1} onChange={(v) => setIncomeColumn(v-1)} />
                    }
                </Group>
            </Stack>
        )
    },
    View(){
        const csvData = useParsedData((state) => state.data)
        const header = useParsedData((state) => state.header)

        const dateColumn = useImportedData((state) => state.dateColumn);
        const descColumn = useImportedData((state) => state.descColumn);
        const expenseColumn = useImportedData((state) => state.expenseColumn);
        const incomeColumn = useImportedData((state) => state.incomeColumn);
        const highlightedColumns = header ?
            [csvData.meta.fields[dateColumn], csvData.meta.fields[descColumn], csvData.meta.fields[expenseColumn], csvData.meta.fields[incomeColumn]] :
            [dateColumn, descColumn, expenseColumn, incomeColumn]

        function mapRow(row, i){
            const shade = i % 2 === 0 ? "0" : "1"
            if(!header) return row.map((cell, j) => (
                <Table.Td key={`${i}:${j}`} {...highlightedColumns.includes(j) && {style:{backgroundColor: `var(--mantine-color-yellow-${shade})`}}}>{cell}</Table.Td>
            ));
            else return csvData.meta.fields.map((field) => (
                <Table.Td key={`${i}:${field}`} {...highlightedColumns.includes(field) && {style:{backgroundColor: `var(--mantine-color-yellow-${shade})`}}}>{row[field]}</Table.Td>
            ));
        }

        return (
            <ScrollArea offsetScrollbars type="auto" h="calc(100vh - var(--app-shell-header-offset) - 2rem)">
                <Table striped="odd" stickyHeader={true}>
                    {header ? <Table.Thead style={{boxShadow: "0 1px 0 var(--mantine-color-gray-3)"}}>
                        <Table.Tr>
                            {csvData.meta.fields.map((field) => (
                                <Table.Th key={`h:${field}`}>{field}</Table.Th>
                            ))}
                        </Table.Tr>
                    </Table.Thead> : null}
                    <Table.Tbody>
                        {csvData.data.map((row, i) => (
                            <Table.Tr key={i}>{mapRow(row, i)}</Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </ScrollArea>
        )
    }
}
export default CSVExtractor