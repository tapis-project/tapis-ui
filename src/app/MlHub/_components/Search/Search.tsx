import React from "react";
import { Button } from "reactstrap";
import { ArrowDropDownCircleRounded, ArrowUpwardRounded } from "@mui/icons-material";
import { Box } from "@mui/material";
import { DropdownSelector, Navbar } from "@tapis/tapisui-common";

const Search: React.FC = () => {
    return(
        <Navbar>
            <DropdownSelector
            Name
            Child
            Thing>
                "Dropdown"
            </DropdownSelector>
            <Box>
                "Box"
            </Box>
            <Button>
                Search
            </Button>
        </Navbar>
    )
   
}

export default Search;