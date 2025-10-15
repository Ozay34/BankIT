import {Accordion, Button, Container, Grid, Input, Paper, Switch, Text} from "@mantine/core";
import {
    IconTrash,
    IconUpload,
    IconFileArrowLeft,
    IconCategoryPlus,
    IconFileSearch,
    IconGraph
} from "@tabler/icons-react";
import {useState} from "react";
import UploadView from "./UploadView.jsx";
import {ExtractorComponents} from "./extractors/index.js";
import {useImportedData} from "../data/ImportedData.js";
import CategoryView from "./CategoryView.jsx";
import {useCategoryData} from "../data/CategoryData.js";
import AnalyzeView, {AnalyzeSettings} from "./AnalyzeView.jsx";

export default function DataView() {

    const [Extractor, setExtractor] = useState(ExtractorComponents.csv.component);
    const isLoaded = useImportedData((state) => state.isLoaded());
    const clearData = useImportedData((state) => state.clearData);
    const caseSensitive = useCategoryData((state) => state.caseSensitive);
    const setCaseSensitive = useCategoryData((state) => state.setCaseSensitive);
    const [selectedStep, setSelectedStep] = useState(isLoaded ? "Extract" : "Upload");

    function navigate(step){
        setSelectedStep(step);
    }

    function setExtractorAndNavigate(extractor){
        setExtractor(extractor)
        setSelectedStep("Extract")
    }

    function renderBody(){
        switch (selectedStep){
            case "Upload": return <UploadView setExtractor={setExtractorAndNavigate}></UploadView>
            case "Extract": return <Extractor.View />
            case "Categorize": return <CategoryView />
            case "Analyze": return <AnalyzeView />
        }
    }

    return (
        <Container size={1240} pt="md">
            <Grid>
                <Grid.Col span={3}>
                    <Paper shadow="md" pos="sticky" top="calc(var(--app-shell-header-offset) + 1rem)">
                        <Accordion value={selectedStep} onChange={navigate}>
                            <Accordion.Item value="Upload">
                                <Accordion.Control icon={<IconUpload />}>
                                    <Text size={"xl"}>Upload</Text>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <Button onClick={clearData} color="red"><IconTrash />Clear data</Button>
                                </Accordion.Panel>
                            </Accordion.Item>
                            <Accordion.Item value="Extract">
                                <Accordion.Control icon={<IconFileArrowLeft />} disabled={!isLoaded}>
                                    <Text size={"xl"}>Extract</Text>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    {isLoaded && <Extractor.Settings />}
                                </Accordion.Panel>
                            </Accordion.Item>
                            <Accordion.Item value="Categorize">
                                <Accordion.Control icon={<IconCategoryPlus />} disabled={!isLoaded}>
                                    <Text size={"xl"}>Categorize</Text>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <Input.Wrapper label="Case sensitive">
                                        <Switch size="md" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.currentTarget.checked)} />
                                    </Input.Wrapper>
                                </Accordion.Panel>
                            </Accordion.Item>
                            <Accordion.Item value="Analyze">
                                <Accordion.Control icon={<IconFileSearch />} disabled={!isLoaded}>
                                    <Text size={"xl"}>Analyze</Text>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <AnalyzeSettings />
                                </Accordion.Panel>
                            </Accordion.Item>
                        </Accordion>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={9}>
                    {renderBody()}
                </Grid.Col>
            </Grid>
        </Container>
    );
}