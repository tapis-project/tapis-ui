import React, { useState } from "react"
import { Workflows } from "@tapis/tapis-typescript"
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { decode } from "base-64";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import styles from "./FunctionTaskEditor.module.scss"
import { ArrowBack, Info, Hub, CompareArrows, GitHub } from '@mui/icons-material';
import { Box, TextField } from '@mui/material';

type SidebarProps = {
  title: string
  toggle: () => void
}

const Sidebar: React.FC<React.PropsWithChildren<SidebarProps>> = ({children, title, toggle}) => {
  return (
    <div className={styles["sidebar"]}>
      <div className={styles["menu"]}>
        <h2>{title}</h2>
        <ArrowBack onClick={toggle} className={styles["back"]}/>
      </div>
      {children}
    </div>
  )
}

type FunctionTaskEditorProps = {
  task: Workflows.FunctionTask
}

const FunctionTaskEditor: React.FC<FunctionTaskEditorProps> = ({task}) => {
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined)
  const setTab = (tab: string | undefined) => {
    let tabToSet = tab
    if (activeTab == tab) {
      tabToSet = undefined
    }
    setActiveTab(tabToSet)
  }
  return (
    <div>
      <Stack spacing={2} direction="row" className={styles["stack"]}>
        <Button
          startIcon={<Info />}
          variant="outlined"
          size="small"
          onClick={() => {setTab("details")}}
        >
          Details
        </Button>
        <Button
          startIcon={<Hub />}
          variant="outlined"
          size="small"
          onClick={() => {setTab("deps")}}
        >
          Dependencies
        </Button>
        <Button 
          startIcon={<CompareArrows />}
          variant="outlined"
          size="small"
          onClick={() => {setTab("io")}}
        >
          I/O
        </Button>
        <Button
          startIcon={<GitHub />}
          variant="outlined" 
          size="small" 
          onClick={() => {setTab("git")}}
        >
          Git
        </Button>
      </Stack>
      <div className={styles["container"]}>
        {
          activeTab === "details" &&
          <Sidebar title={"Details"} toggle={() => {setActiveTab(undefined)}}>
            <Box
              component="form"
              sx={{
                '& > :not(style)': { width: '100%', backgroundColor: "#F6F7F9" },
              }}
              className={styles["form"]}
              noValidate
              autoComplete="off"
            >
              <TextField label="Id" size="small" variant="outlined" value={task.id}/>
              <TextField label="Type" disabled size="small" variant="outlined" value={task.type}/>
              <TextField label="Description" variant="outlined" multiline rows={4} value={task.description}/>
            </Box>
          </Sidebar>
        }
        {
          activeTab === "deps" &&
          <Sidebar title={"Dependencies"} toggle={() => {setActiveTab(undefined)}}>
            Test
          </Sidebar>
        }
        {
          activeTab === "io" &&
          <Sidebar title={"Inputs & Outputs"} toggle={() => {setActiveTab(undefined)}}>
            Test
          </Sidebar>
        }
        {
          activeTab === "git" &&
          <Sidebar title={"Git Repositories"} toggle={() => {setActiveTab(undefined)}}>
            Test
          </Sidebar>
        }
        <CodeMirror
          value={(task.code && decode((task.code)) || "")}
          editable={!task.entrypoint}
          extensions={[python()]}
          theme={vscodeDark}
          className={`${styles["code"]} ${activeTab ? styles["body-with-sidebar"] : styles["body-wo-sidebar"]}`}
          style={{
            fontSize: 12,
            backgroundColor: '#f5f5f5',
            fontFamily:
            'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
          }}
        />
      </div>
    </div>
  )
}

export default FunctionTaskEditor