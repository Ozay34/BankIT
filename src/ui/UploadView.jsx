import {Checkbox, Container, Flex, Group, Text, Title} from "@mantine/core";
import {Dropzone} from "@mantine/dropzone";
import {IconFile, IconUpload, IconX} from "@tabler/icons-react";
import {useState} from "react";
import {supportedMIMETypes, supportedFileTypes, ExtractorComponents} from "./extractors/index.js";
import {useImportedData} from "../data/ImportedData.js";

export default function UploadView({setExtractor}) {

    const [saveData, setSaveData] = useState(false);
    const setRaw = useImportedData((state) => state.setRaw);

    function fileUpload(file){
        const extractor = Object.values(ExtractorComponents).find((extractor) => extractor.accept.includes(file.type));
        extractor.serialize(file, (value) => {
            setRaw(value, saveData);
            setExtractor(extractor.component);
        });
    }

    return (
        <Container pt={100}>
            <Flex align="center" direction="column" gap="md">
                <Title rank={2}>
                    Analyze banking history
                </Title>
                <Checkbox checked={saveData} onChange={(e) => setSaveData(e.currentTarget.checked)} label="Save my data" />
                <Dropzone onDrop={(f) => fileUpload(f[0])} accept={supportedMIMETypes} multiple={false}>
                    <Group justify="center" gap="xl" mih={200} miw={600}>
                        <Dropzone.Accept>
                            <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                            <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                            <IconFile size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
                        </Dropzone.Idle>

                        <div>
                            <Text size="xl">Drop a file or click to select</Text>
                            <Text size="xm">Accepts: {supportedFileTypes.join(", ")}</Text>
                        </div>
                    </Group>
                </Dropzone>
            </Flex>
        </Container>
    );
}