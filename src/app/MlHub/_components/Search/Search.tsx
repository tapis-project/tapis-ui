import React from "react";
import { Button } from "reactstrap";
import { ArrowDropDownCircleRounded, ArrowUpwardRounded, InputOutlined } from "@mui/icons-material";
import { Box, Input, InputLabel, Select } from "@mui/material";
import { DropdownSelector, Navbar } from "@tapis/tapisui-common";

const SearchBar: React.FC = () => {
    return(
        <Navbar>
            Filter By: 
            <Select name="options"> 
                <option value="Author"> Author</option>
                <option value="Language"> Language </option>
                <option value="Library"> Library </option>
                <option value="Task"> Task </option>
                <option value="Trained Dataset"> Trained Dataset </option>
                <option value="Query"> Query </option>
            </Select>
            <label>
                <input name="Enter Keyword"/>
            </label>
            <Button>
                Search
            </Button>
        </Navbar>
    )
   
}

export default SearchBar;