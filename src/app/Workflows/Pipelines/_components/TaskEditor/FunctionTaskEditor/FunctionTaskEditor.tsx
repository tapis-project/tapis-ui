import React, { useState, useMemo } from "react"
import { Workflows } from "@tapis/tapis-typescript"
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { decode } from "base-64";
import Stack from '@mui/material/Stack';
import styles from "./FunctionTaskEditor.module.scss"
import { ArrowBack, Info, Hub, CompareArrows, GitHub, Tune, Memory } from '@mui/icons-material';
import { Button, Box, TextField, Checkbox, FormGroup, FormControlLabel, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

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
  task: Workflows.FunctionTask,
  tasks: Array<Workflows.Task>
}

const FunctionTaskEditor: React.FC<FunctionTaskEditorProps> = ({
  task,
  tasks
}) => {
  const [activeTab, setActiveTab] = useState<string | undefined>("general")

  const setTab = (tab: string | undefined) => {
    let tabToSet = tab
    if (activeTab == tab) {
      tabToSet = undefined
    }
    setActiveTab(tabToSet)
  }

  const dependencyTaskIds = useMemo(() => {
    return (task.depends_on || []).map((dep) => {
      return dep.id
    })
  }, [task])

  const packageConverter = (packages: Array<string>) => {
    let packageString = "";
    packages.map((name) => {
      packageString += name + "\n"
    })

    return packageString
  }

  return (
    <div>
      <Stack spacing={2} direction="row" className={styles["stack"]}>
        <Button
          startIcon={<Info />}
          variant="outlined"
          color={activeTab === "general" ? "secondary" : "primary"}
          size="small"
          onClick={() => {setTab("general")}}
        >
          General
        </Button>
        <Button 
          startIcon={<CompareArrows />}
          variant="outlined"
          size="small"
          color={activeTab === "io" ? "secondary" : "primary"}
          onClick={() => {setTab("io")}}
        >
          I/O
        </Button>
        <Button
          startIcon={<Tune />}
          variant="outlined" 
          size="small" 
          color={activeTab === "execprofile" ? "secondary" : "primary"}
          onClick={() => {setTab("execprofile")}}
        >
          Exec. Profile
        </Button>
        <Button
          startIcon={<Hub />}
          variant="outlined"
          size="small"
          color={activeTab === "deps" ? "secondary" : "primary"}
          onClick={() => {setTab("deps")}}
        >
          Dependencies
        </Button>
        <Button
          startIcon={<Memory />}
          variant="outlined" 
          size="small"
          color={activeTab === "runtime" ? "secondary" : "primary"}
          onClick={() => {setTab("runtime")}}
        >
          Runtime
        </Button>
        <Button
          startIcon={<GitHub />}
          variant="outlined" 
          size="small"
          color={activeTab === "git" ? "secondary" : "primary"}
          onClick={() => {setTab("git")}}
        >
          Git
        </Button>
      </Stack>
      <div className={styles["container"]}>
        {
          activeTab === "general" &&
          <Sidebar title={"General"} toggle={() => {setActiveTab(undefined)}}>
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
            <FormGroup className={styles["form"]}>
            {
              tasks.map((dep) => {
                return (
                  <FormControlLabel
                    control={<Checkbox defaultChecked={dependencyTaskIds.includes(task.id)} />}
                    label={dep.id}
                  />
                )
              })
            }
            </FormGroup>
          </Sidebar>
        }
        {
          activeTab === "io" &&
          <Sidebar title={"Inputs & Outputs"} toggle={() => {setActiveTab(undefined)}}>
            {Object.entries(task.input || {}).map((k, v) => {
              return `${k}:${v}`
            })}
          </Sidebar>
        }
        {
          activeTab === "execprofile" &&
          <Sidebar title={"Execution Profile"} toggle={() => {setActiveTab(undefined)}}>
            <div className={styles["form"]}>
              <FormControl fullWidth margin="dense" style={{marginBottom: "-16px"}}>
                <InputLabel size="small" id="mode">Task invocation mode</InputLabel>
                <Select
                  label="Task invocation mode"
                  onChange={() => {}}
                  labelId="mode"
                  size="small"
                  defaultValue={task.execution_profile?.invocation_mode}
                >
                  {
                    Object.values(Workflows.EnumInvocationMode).map((mode) => {
                      return <MenuItem selected={mode === task.execution_profile?.invocation_mode} value={mode}>{mode}</MenuItem>
                    })
                  }
                </Select>
              </FormControl>
              <FormHelperText>
                Excute tasks asynchronously or serially
              </FormHelperText>
              <FormControl fullWidth margin="normal" style={{marginBottom: "-16px"}}>
                <InputLabel size="small" id="retrypolicy">Retry policy</InputLabel>
                <Select
                  label="Retry Policy"
                  onChange={() => {}}
                  labelId="retrypolicy"
                  size="small"
                  defaultValue={task.execution_profile?.retry_policy}
                >
                  {
                    Object.values(Workflows.EnumRetryPolicy).map((policy) => {
                      return <MenuItem selected={policy === task.execution_profile?.retry_policy} value={policy}>{policy}</MenuItem>
                    })
                  }
                </Select>
              </FormControl>
              <FormHelperText>
                Controls how soon to retry a task once it enters a failed state
              </FormHelperText>
              <FormControl fullWidth margin="normal" style={{marginBottom: "-16px"}}>
                <InputLabel size="small" id="flavor">Flavor</InputLabel>
                <Select
                  label="Flavor"
                  labelId="flavor"
                  size="small"
                  defaultValue={task.execution_profile?.flavor}
                >
                  {
                    Object.values(Workflows.EnumTaskFlavor).map((flavor) => {
                      return <MenuItem selected={flavor === task.execution_profile?.flavor} value={flavor}>{flavor}</MenuItem>
                    })
                  }
                </Select>
              </FormControl>
              <FormHelperText>
                How many cpus/gpus, and how much memory and disk available to this task
              </FormHelperText>
              <TextField defaultValue={task.execution_profile?.max_retries || 0} size="small" margin="normal" style={{marginBottom: "-16px"}} label="Max retries" variant="outlined"/>
              <FormHelperText>
                Maximum number of times this task will execute after failing once 
              </FormHelperText>    
              <TextField defaultValue={task.execution_profile?.max_exec_time || 86400} size="small" margin="normal" style={{marginBottom: "-16px"}} label="Max exec time (sec)" variant="outlined"/>
              <FormHelperText>
                Max time in seconds this task is permitted to run
              </FormHelperText>
            </div>
          </Sidebar>
        }
        {
          activeTab === "runtime" &&
          <Sidebar title={"Runtime"} toggle={() => {setActiveTab(undefined)}}>
            <div className={styles["form"]}>
              <FormControl fullWidth margin="dense" style={{marginBottom: "-16px"}}>
                <InputLabel size="small" id="environment">Runtime environment</InputLabel>
                <Select
                  size="small"
                  label="Runtime environment"
                  onChange={() => {}}
                  labelId="environment"
                  defaultValue={task.runtime}
                >
                  {
                    Object.values(Workflows.EnumRuntimeEnvironment).map((runtimeEnv) => {
                      return (
                        <MenuItem
                          value={runtimeEnv}
                          selected={runtimeEnv === task.runtime}
                        >
                          {runtimeEnv}
                        </MenuItem>
                      )
                    })
                  }
                </Select>
              </FormControl>
              <FormHelperText>
                The runtime envrionment in which the function code will be executed
              </FormHelperText>
              <TextField
                label="Packages"
                variant="outlined"
                multiline
                rows={4}
                defaultValue={packageConverter(task.packages || [])}
                margin="normal"
                style={{marginBottom: "-16px"}}
              />
              <FormHelperText>
                Each package must be on a seperate line. May be just the package name or the pacakge name followed by the version. Ex. tapipy==^1.6.0
              </FormHelperText>
              <FormControl fullWidth margin="normal" style={{marginBottom: "-16px"}}>
                <InputLabel size="small" id="installer">Installer</InputLabel>
                <Select
                  size="small"
                  label="Installer"
                  defaultValue={task.installer}
                >
                  {
                    Object.values(Workflows.EnumInstaller).map((installer) => {
                      return (
                        <MenuItem
                          selected={installer === task.installer}
                          value={installer}
                        >
                          {installer}
                        </MenuItem>
                      )
                    })
                  }
                </Select>
              </FormControl>
              <FormHelperText>
                Choose which installer to use to install the packages above
              </FormHelperText>
            </div>
          </Sidebar>
        }
        {
          activeTab === "git" &&
          <Sidebar title={"Git Repositories"} toggle={() => {setActiveTab(undefined)}}>
            Test
          </Sidebar>
        }
        <div className={`${styles["code-container"]} ${activeTab ? styles["body-with-sidebar"] : styles["body-wo-sidebar"]}`}>
          <CodeMirror
            value={(task.code !== undefined && decode((task.code)) || "")}
            editable={!task.entrypoint}
            extensions={[python()]}
            theme={vscodeDark}
            className={`${styles["code"]} `}
            style={{
              fontSize: 12,
              backgroundColor: '#f5f5f5',
              fontFamily:
              'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default FunctionTaskEditor