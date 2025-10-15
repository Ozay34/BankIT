import {useCategoryData} from "../data/CategoryData.js";
import {
    ActionIcon,
    Fieldset,
    Grid,
    Group, Highlight,
    Pill, PillsInput,
    ScrollArea,
    Stack,
    Table,
    TextInput, UnstyledButton
} from "@mantine/core";
import {IconPlus, IconTrash} from "@tabler/icons-react";
import {useRef, useState} from "react";
import {useExtractedData} from "../data/ImportedData.js";

function CategoryItem({category, index, onKeywordChange}){

    const updateCategory = useCategoryData((state) => state.updateCategory)
    const removeCategory = useCategoryData((state) => state.removeCategory)
    const addKeyword = useCategoryData((state) => state.addKeyword)
    const removeKeyword = useCategoryData((state) => state.removeKeyword)
    const keywordInputRef = useRef(null)

    function onAddPress(){
        addKeyword(index, keywordInputRef.current.value)
        keywordInputRef.current.value = ""
        onKeywordChange("")
    }
    function onKeyPress(e){
        if(e.key === "Enter") onAddPress()
    }

    return (
        <Stack gap={0}>
            <Group align="flex-end" justify="flex-end" grow preventGrowOverflow={false}>
                <TextInput size="md" label="Category" value={category.category} onChange={(e) => updateCategory(index, e.currentTarget.value)} />
                <ActionIcon size="lg" onClick={() => removeCategory(index)} mb={4} style={{flexGrow: 0}} color="red">
                    <IconTrash />
                </ActionIcon>
            </Group>
            <Group grow>
                <PillsInput label="Keywords" rightSection={
                    <UnstyledButton mt={4} onClick={onAddPress}><IconPlus /></UnstyledButton>
                }>
                    <Pill.Group>
                        {category.keywords.map((keyword) => (
                            <Pill key={keyword} withRemoveButton onRemove={() => removeKeyword(index, keyword)}>{keyword}</Pill>
                        ))}
                        <PillsInput.Field ref={keywordInputRef} onKeyDown={onKeyPress} onChange={(e) => onKeywordChange(e.currentTarget.value)}/>
                    </Pill.Group>
                </PillsInput>
            </Group>
        </Stack>
    )
}

export default function CategoryView() {

    const extractedData = useExtractedData()
    const categories = useCategoryData((state) => state.categories)
    const caseSensitive = useCategoryData((state) => state.caseSensitive)
    const addBlankCategory = useCategoryData((state) => state.addBlankCategory)
    const [highlighted, setHighlighted] = useState("")

    const allKeywords = categories.map((category) => category.keywords).flat()
    const expenses = extractedData.filter((transaction) => transaction.expense > 0)
    const descriptions = [...new Set(expenses.map((transaction) => transaction.description))].filter((desc) => (
        typeof desc === "string" && allKeywords.find((keyword) => (
            caseSensitive ? desc.includes(keyword) :
                desc.toUpperCase().includes(keyword.toUpperCase())
        )) === undefined
    ));

    return (
        <Grid>
            <Grid.Col span={6}>
                <Fieldset legend="Categories">
                    <ScrollArea.Autosize offsetScrollbars type="auto" mah="calc(100vh - var(--app-shell-header-offset) - 9rem)">
                        <Stack>
                            {categories.map((category, i) => (
                                <CategoryItem key={i} category={category} index={i} onKeywordChange={setHighlighted} />
                            ))}
                        </Stack>
                    </ScrollArea.Autosize>
                    <ActionIcon size="lg" onClick={addBlankCategory} mt="lg">
                        <IconPlus />
                    </ActionIcon>
                </Fieldset>
            </Grid.Col>
            <Grid.Col span={6}>
                <Fieldset legend="Transaction Descriptions">
                    <ScrollArea.Autosize offsetScrollbars type="auto" mah="calc(100vh - var(--app-shell-header-offset) - 6rem)">
                            <Table>
                                <Table.Tbody>
                                    {descriptions.map((description) => (
                                        <Table.Tr key={description}>
                                            <Table.Td>
                                                <Highlight highlight={highlighted} span>
                                                    {description}
                                                </Highlight>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                    </ScrollArea.Autosize>
                </Fieldset>
            </Grid.Col>
        </Grid>
    );
}