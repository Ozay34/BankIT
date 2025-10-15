import {
    Accordion,
    Box,
    Button, Center,
    Divider,
    Grid,
    Group,
    NumberFormatter,
    ScrollArea,
    Select, Space,
    Stack,
    Table,
    Text
} from "@mantine/core";
import {getPeriodDuration, Periods, useAnalyzeData} from "../data/AnalyzeData.js";
import {useExtractedData, useImportedData} from "../data/ImportedData.js";
import {useCategoryData} from "../data/CategoryData.js";
import {DateInput} from "@mantine/dates";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import {IconTrash, IconUpload} from "@tabler/icons-react";
dayjs.extend(isBetween)

export function AnalyzeSettings() {

    const extractedData = useExtractedData().sort((a, b) => a.date.isAfter(b.date))
    const period = useAnalyzeData((state) => state.period)
    const setPeriod = useAnalyzeData((state) => state.setPeriod)
    const periodStart = useAnalyzeData((state) => state.periodStart)
    const setPeriodStart = useAnalyzeData((state) => state.setPeriodStart)

    const periods = Object.values(Periods).map((period) => period.display)
    const firstDate = extractedData[0].date
    const lastDate = firstDate.add(getPeriodDuration(period)).subtract(1, "days")

    return (
        <Stack>
            <Select label="Period" data={periods} value={period} onChange={setPeriod} />
            {(period !== Periods.Monthly.display && period !== Periods.Yearly.display) &&
                <DateInput label="Period Start"
                           value={periodStart}
                           onChange={setPeriodStart}
                           minDate={firstDate}
                           maxDate={lastDate}
                           firstDayOfWeek={0} />}
        </Stack>
    )
}

export default function AnalyzeView() {

    const extractedData = useExtractedData().sort((a, b) => a.date.isAfter(b.date))
    const categories = useCategoryData((state) => state.categories)
    const caseSensitive = useCategoryData((state) => state.caseSensitive)
    const dateFormat = useImportedData((state) => state.dateFormat);
    const period = useAnalyzeData((state) => state.period)
    const periodStart = dayjs(useAnalyzeData((state) => state.periodStart))
    const periodDuration = getPeriodDuration(period)

    const firstPeriod = (() => {
        const firstDate = extractedData[0].date
        switch (period){
            case Periods.Yearly.display:
                return {start: firstDate.startOf("year"), end: firstDate.startOf("year").add(1, "year")}
            case Periods.Monthly.display:
                return {start: firstDate.startOf("month"), end: firstDate.startOf("month").add(1, "month")}
            case Periods.BiWeekly.display:
                if(firstDate.isSame(periodStart, "day"))
                    return {start: firstDate, end: firstDate.add(periodDuration)}
                else return {start: firstDate, end: periodStart}
        }
    })()

    const bucketedData = extractedData.reduce((bucket, transaction) => {
        if(!transaction.date.isValid()) return bucket;

        let currentBucket = bucket.at(-1);

        // Begin new bucket for period (while in case we skip periods)
        while(!transaction.date.isBetween(currentBucket.start, currentBucket.end, "day", "[)")){
            currentBucket = {start: currentBucket.end, end: currentBucket.end.add(periodDuration), expenses: {}, earnings: []}
            bucket.push(currentBucket)
        }

        if(transaction.income > 0){
            currentBucket.earnings.push(transaction)
        }
        if(transaction.expense > 0){
            // Categorize and bucket expenses
            const category = categories.find((category) => (
                category.keywords.find((keyword) => (
                    caseSensitive ? transaction.description.includes(keyword) :
                        transaction.description.toUpperCase().includes(keyword.toUpperCase())
                )) !== undefined
            ))?.category || "Other"

            if(!(category in currentBucket.expenses)) currentBucket.expenses[category] = []
            currentBucket.expenses[category].push(transaction)
        }

        return bucket;
    }, [{...firstPeriod, expenses: {}, earnings: []}])

    function getDateDisplay(bucket){
        if(period === Periods.Yearly.display) return (
            <Stack mt="lg" gap={0} align="center">
                <Text style={{fontSize: "2rem"}}>{bucket.start.format("YYYY")}</Text>
            </Stack>
        )
        if(period === Periods.Monthly.display) return (
            <Stack mt="lg" gap={0} align="center">
                <Text style={{fontSize: "2rem"}}>{bucket.start.format("MMM")}</Text>
                <Text size="lg" c="gray">{bucket.start.format("YYYY")}</Text>
            </Stack>
        )
        else return (
            <Stack mt="lg" gap={0} align="center">
                <Text style={{fontSize: "2rem"}}>{bucket.start.format("MMM DD")}</Text>
                <Text size="lg" c="gray">{bucket.start.format("YYYY")}</Text>
                _
                <Text style={{fontSize: "2rem"}}>{bucket.end.format("MMM DD")}</Text>
                <Text size="lg" c="gray">{bucket.end.format("YYYY")}</Text>
            </Stack>
        )
    }

    function getSortedExpenses(bucket){
        return Object.entries(bucket.expenses).sort(([categoryA, transactionsA], [categoryB, transactionsB]) => (
            getTotalExpenses(transactionsB) - getTotalExpenses(transactionsA)
        ))
    }
    function getTotalExpenses(transactions){
       return transactions.reduce((sum, transaction) => transaction.expense + sum, 0)
    }
    function getTotalEarnings(transactions){
        return transactions.reduce((sum, transaction) => transaction.income + sum, 0)
    }

    return (
        <ScrollArea offsetScrollbars type="auto" h="calc(100vh - var(--app-shell-header-offset) - 2rem)">
            {bucketedData.map((bucket, i) => (
                <Box key={i}>
                    {i > 0 && <Divider my="xl"/>}
                    <Grid>
                        <Grid.Col span={2}>
                            <Stack>
                                {getDateDisplay(bucket)}
                                <Stack  gap={0} align="center">
                                    <Text c="gray">Earnings</Text>
                                    <Text size="lg" c="green">
                                        <NumberFormatter prefix="$" thousandSeparator fixedDecimalScale  decimalScale={2} value={getTotalEarnings(bucket.earnings)} />
                                    </Text>
                                    <Space h="sm" />
                                    <Text c="gray">Expenses</Text>
                                    <Text size="lg" c={getTotalEarnings(bucket.earnings) > getTotalExpenses(Object.values(bucket.expenses).flat()) ? "orange" : "red"}>
                                        <NumberFormatter prefix="$" thousandSeparator fixedDecimalScale  decimalScale={2} value={getTotalExpenses(Object.values(bucket.expenses).flat())} />
                                    </Text>
                                    <Space h="sm" />
                                    <Text c="gray">Net</Text>
                                    <Text size="lg" c={getTotalEarnings(bucket.earnings) > getTotalExpenses(Object.values(bucket.expenses).flat()) ? "green" : "red"}>
                                        <NumberFormatter prefix="$" thousandSeparator fixedDecimalScale  decimalScale={2} value={getTotalEarnings(bucket.earnings) - getTotalExpenses(Object.values(bucket.expenses).flat())} />
                                    </Text>
                                </Stack>
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={10}>
                            <Accordion multiple>
                                {getSortedExpenses(bucket).map(([category, transactions]) => (
                                    <Accordion.Item key={`${i}:${category}`} value={category}>
                                        <Accordion.Control>
                                            <Group justify="space-between" mx="sm">
                                                <Text>{category}</Text>
                                                <Text><NumberFormatter prefix="$" thousandSeparator fixedDecimalScale  decimalScale={2} value={getTotalExpenses(transactions)} /></Text>
                                            </Group>
                                        </Accordion.Control>
                                        <Accordion.Panel>
                                            <Table>
                                                <Table.Thead>
                                                    <Table.Tr>
                                                        <Table.Th>Date</Table.Th>
                                                        <Table.Th>Description</Table.Th>
                                                        <Table.Th>Amount</Table.Th>
                                                    </Table.Tr>
                                                </Table.Thead>
                                                <Table.Tbody>
                                                    {transactions.map((transaction, j) => (
                                                        <Table.Tr key={`${i}:${category}:${j}`}>
                                                            <Table.Td>{transaction.date.format(dateFormat || undefined)}</Table.Td>
                                                            <Table.Td>{transaction.description}</Table.Td>
                                                            <Table.Td><NumberFormatter prefix="$" thousandSeparator fixedDecimalScale  decimalScale={2} value={transaction.expense} /></Table.Td>
                                                        </Table.Tr>
                                                    ))}
                                                </Table.Tbody>
                                            </Table>
                                        </Accordion.Panel>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        </Grid.Col>
                    </Grid>
                </Box>
            ))}
        </ScrollArea>
    );
}