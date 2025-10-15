import "@mantine/core/styles.css"
import "@mantine/dates/styles.css"
import "@mantine/dropzone/styles.css"
import {AppShell, Group, MantineProvider, Title} from "@mantine/core";
import {IconPigMoney} from "@tabler/icons-react";
import DataView from "./ui/DataView.jsx";

export default function App() {

    return (
        <MantineProvider>
            <AppShell header={{height: 70}}>
                <AppShell.Header>
                    <Group p="sm">
                        <IconPigMoney size={46} />
                        <Title> Bank IT</Title>
                    </Group>
                </AppShell.Header>
                <AppShell.Main>
                    <DataView />
                </AppShell.Main>
            </AppShell>
        </MantineProvider>
    )
}
